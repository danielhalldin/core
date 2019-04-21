import { ApolloServer } from "apollo-server-express";
import { RedisCache } from "apollo-server-cache-redis";
import compression from "compression";
import express from "express";
import schema from "./grapql/schema";
import throng from "throng";
import _get from "lodash/get";

import untappdAPI from "./lib/web/dataSources/untappdAPI";
import elasticsearchAPI from "./lib/web/dataSources/elasticsearchAPI";

import loginRoutes from "./lib/web/routes/login";
import omdbAPI from "./lib/web/dataSources/omdbApi";
import updateRoutes from "./lib/web/routes/update";
import pushRoutes from "./lib/web/routes/push";

import config from "./config";
import { decrypt } from "./lib/jwtHandler";
import logger from "./lib/logger";
import morgan from "morgan";

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
    engine: {
      apiKey: process.env.ENGINE_API_KEY
    },
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
    context: ({ req }) => {
      const raw_untappd_access_token = _get(
        req,
        "headers.x-untappd-access-token"
      );
      const untappd_access_token = raw_untappd_access_token
        ? decrypt(raw_untappd_access_token)
        : "";
      return {
        untappd_access_token
      };
    }
  });

  const app = express();
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.static("public"));

  // Routes
  loginRoutes(app);
  updateRoutes(app);
  pushRoutes(app);

  https: server.applyMiddleware({ app });

  app.listen({ port: config.port }, () =>
    logger.info(`Server is running on ${config.port}`)
  );
}

const WORKERS = config.webConcurrenct || 1;
throng(
  {
    workers: WORKERS,
    lifetime: Infinity
  },
  run
);
