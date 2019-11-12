import _get from 'lodash/get';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express from 'express';
import logger from './lib/logger';
import morgan from 'morgan';
import { RedisCache } from 'apollo-server-cache-redis';

import schema from './lib/web/grapql/executableSchema';

import untappdAPI from './lib/web/grapql/dataSources/untappdAPI';
import elasticsearchAPI from './lib/web/grapql/dataSources/elasticsearchAPI';
import { decrypt } from './lib/jwtHandler';
import config from './config';

import loginRoutes from './lib/web/routes/login';
import updateRoutes from './lib/web/routes/update';
import pushRoutes from './lib/web/routes/push';

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
    const raw_untappd_access_token = _get(req, 'headers.x-untappd-access-token');
    const untappd_access_token = raw_untappd_access_token ? decrypt(raw_untappd_access_token) : '';
    return {
      untappd_access_token
    };
  }
});

const app = express();
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

// Routes
loginRoutes(app);
updateRoutes(app);
pushRoutes(app);

server.applyMiddleware({ app });

app.listen({ port: config.port }, () => logger.info(`Server is running on ${config.port}`));
