import { ApolloServer } from "apollo-server-express";
import { RedisCache } from "apollo-server-cache-redis";
import compression from "compression";
import config from "./config";
import elasticsearchAPI from "./lib/web/dataSources/elasticsearchAPI";
import express from "express";
import fetch from "node-fetch";
import IndexClient from "./lib/worker/clients/indexClient";
import logger from "./lib/logger";
import omdbAPI from "./lib/web/dataSources/omdbApi";
import querystring from "querystring";
import schema from "./grapql/schema";
import throng from "throng";
import untappdAPI from "./lib/web/dataSources/untappdAPI";
import morgan from "morgan";
import { encrypt, decrypt } from "./lib/jwtHandler";

async function run() {
  const redisCache = new RedisCache({
    url: config.rediscloudUrl,
    options: { no_ready_check: true }
  });

  const server = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    cache: redisCache,
    persistedQueries: redisCache,
    introspection: config.graphql.introspectionEnabled,
    playground: config.graphql.playgroundEnabled,
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
      const untappd_access_token = decrypt(req.headers.untappd_access_token);
      return {
        untappd_access_token
      };
    }
  });

  const app = express();
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.static("public"));

  // Untappd token
  app.get("/login", function(req, res) {
    const params = {
      client_id: config.untappd.clientID,
      response_type: "code",
      redirect_url: encodeURI(config.newBeers.authUrl)
    };

    const url =
      config.untappd.authBaseUrl +
      "/authenticate/?" +
      querystring.stringify(params);

    res.redirect(url);
  });

  app.get("/auth", async function(req, res) {
    const code = req.query.code;
    const params = {
      client_id: config.untappd.clientID,
      client_secret: config.untappd.clientSecret,
      response_type: "code",
      redirect_url: encodeURI(config.newBeers.authUrl),
      code: code
    };

    const url =
      config.untappd.authBaseUrl +
      "/authorize/?" +
      querystring.stringify(params);
    const authorizeResponse = await fetch(url);
    const token = (await authorizeResponse.json()).response.access_token;
    const jwt = encrypt(token);
    res.redirect(`${config.newBeers.url}/?token=${jwt}`);
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

  const port = config.port;
  app.listen({ port }, () => logger.info(`Server is running on ${port}`));
}

const WORKERS = config.webConcurrenct || 1;
throng(
  {
    workers: WORKERS,
    lifetime: Infinity
  },
  run
);
