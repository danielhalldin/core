import throng from "throng";
import express from "express";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import { RedisCache } from "apollo-server-cache-redis";
import omdbAPI from "./grapql/dataSources/omdbApi";
import schema from "./grapql/movies";

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
      OmdbAPI: new omdbAPI()
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
      return {};
    }
  });

  const app = express();
  app.use(compression());
  server.applyMiddleware({ app });

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
