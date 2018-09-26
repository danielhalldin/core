import throng from "throng";
import express from "express";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import { RedisCache } from "apollo-server-cache-redis";
import omdbAPI from "./grapql/dataSources/omdbApi";
import untappdAPI from "./grapql/dataSources/untappdAPI";
import elasticsearchAPI from "./grapql/dataSources/elasticsearchAPI";
import schema from "./grapql/schema";
import config from "./config";
import fetch from "node-fetch";

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
      }&response_type=code&redirect_url=http%3A%2F%2Flocalhost%3A4444%2Fauth`
    );
  });

  app.get("/auth", async function(req, res) {
    const code = req.query.code;
    const url = `https://untappd.com/oauth/authorize/?client_id=${
      config.untappedClientID
    }&client_secret=${
      config.untappedClientSecret
    }&response_type=code&redirect_url=http%3A%2F%2Flocalhost%3A4444%2Fauth&code=${code}`;
    const authorizeResponse = await fetch(url);
    const token = (await authorizeResponse.json()).response.access_token;
    res.redirect(`http://localhost:3001/?token=${token}`);
  });

  https: server.applyMiddleware({ app });

  const port = process.env.PORT || 4444;
  app.listen({ port }, () => console.log(`Server is running on ${port}`));
}

const WORKERS = process.env.WEB_CONCURRENCY || 1;
throng(
  {
    workers: WORKERS,
    lifetime: Infinity
  },
  run
);
