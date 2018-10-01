import throng from "throng";
import express from "express";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import { RedisCache } from "apollo-server-cache-redis";
import omdbAPI from "./grapql/dataSources/omdbApi";
import untappdAPI from "./grapql/dataSources/untappdAPI";
import elasticsearchAPI from "./grapql/dataSources/elasticsearchAPI";
import IndexClient from "./lib/worker/indexClient";
import schema from "./grapql/schema";
import config from "./config";
import fetch from "node-fetch";
import logger from "./lib/logger";

async function run() {
  const redisCache = new RedisCache({
    url: process.env.REDISCLOUD_URL,
    options: { no_ready_check: true }
  });

  const server = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    cache: redisCache,
    persistedQueries: redisCache,
    dataSources: () => ({
      OmdbAPI: new omdbAPI(),
      UntappdAPI: new untappdAPI(),
      ElasticsearchApi: new elasticsearchAPI()
    }),
    formatError: error => {
      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
        path: error.path
      };
    },
    context: ({ req, res }) => {
      const untappd_access_token = req.headers.untappd_access_token;
      return {
        untappd_access_token
      };
    }
  });

  const app = express();
  app.use(compression());

  // Untappd token
  app.get("/login", function(req, res) {
    res.redirect(
      `https://untappd.com/oauth/authenticate/?client_id=${
        config.untappedClientID
      }&response_type=code&redirect_url=http%3A%2F%2Fdata-source.ddns.net%2Fauth`
    );
  });

  app.get("/auth", async function(req, res) {
    const code = req.query.code;
    const url = `https://untappd.com/oauth/authorize/?client_id=${
      config.untappedClientID
    }&client_secret=${
      config.untappedClientSecret
    }&response_type=code&redirect_url=http%3A%2F%2Fdata-source.ddns.net%2Fauth&code=${code}`;
    const authorizeResponse = await fetch(url);
    const token = (await authorizeResponse.json()).response.access_token;
    res.redirect(`http://new-beers.herokuapp.com/?token=${token}`);
  });

  app.get("/manual-update", async function(req, res) {
    const id = req.query.id;
    const name = req.query.name;
    const indexClient = new IndexClient();
    const documentBody = {
      Namn: name,
      Namn2: null,
      untappdId: null,
      untappdData: null
    };
    const responseData = await indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: id,
      documentBody: documentBody
    });

    res.send(responseData);
  });

  https: server.applyMiddleware({ app });

  const port = process.env.PORT || 4444;
  app.listen({ port }, () => logger.info(`Server is running on ${port}`));
}

const WORKERS = process.env.WEB_CONCURRENCY || 1;
throng(
  {
    workers: WORKERS,
    lifetime: Infinity
  },
  run
);
