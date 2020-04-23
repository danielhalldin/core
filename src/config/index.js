import _get from 'lodash/get';

const envs = _get(process, 'env');

module.exports = {
  port: _get(envs, 'PORT', 6667),
  logLevel: _get(envs, 'LOG_LEVEL', 'info'),
  decoratorInterval: _get(envs, 'DECORATOR_INTERVAL', 10000),
  indexInterval: _get(envs, 'INDEX_INTERVAL', 3600000),
  jwtSecret: _get(envs, 'JWT_SECRET'),
  superUser: _get(envs, 'SUPER_USER'),

  graphql: {
    introspectionEnabled: _get(envs, 'INTROSPECTION_ENABLED') === 'true' || false,
    playgroundEnabled: _get(envs, 'PLAYGROUND_ENABLED') === 'true' || false,
    tracingEnabled: _get(envs, 'TRACING_ENABLED') === 'true' || false,
    engineApiKey: _get(envs, 'ENGINE_API_KEY'),
  },

  rediscloudUrl: _get(envs, 'REDISCLOUD_URL'),

  newBeers: {
    url: _get(envs, 'NEW_BEERS_URL', 'http://new-beers.ddns.net'),
    authUrl: _get(envs, 'NEW_BEERS_AUTH_URL', 'http://data-source.ddns.net/auth'),
  },

  elasticsearch: {
    url: _get(envs, 'BONSAI_URL', 'http://localhost:9200'),
  },

  untappd: {
    baseUrl: _get(envs, 'UNTAPPED_BASE_URL', 'https://api.untappd.com'),
    authBaseUrl: _get(envs, 'UNTAPPED_AUTH_BASE_URL', 'https://untappd.com/oauth'),
    clientID: _get(envs, 'UNTAPPED_CLIENT_ID'),
    clientSecret: _get(envs, 'UNTAPPED_CLIENT_SECRET'),
  },

  systembolaget: {
    url: _get(envs, 'SYSTEMBOLAGET_URL', 'http://www.systembolaget.se/api/assortment/products/xml'),
  },

  webPush: {
    vapidPublicKey: _get(envs, 'VAPID_PUBLIC_KEY'),
    vapidPrivateKey: _get(envs, 'VAPID_PRIVATE_KEY'),
    vapidEmail: _get(envs, 'VAPID_EMAIL'),
  },
};
