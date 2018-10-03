module.exports = {
  port: process.env.PORT || 4444,
  logLevel: process.env.LOG_LEVEL || "info",
  decoratorInterval: process.env.DECORATOR_INTERVAL || 10000,
  webConcurrenct: process.env.WEB_CONCURRENCY || 1,
  graphql: {
    introspectionEnabled:
      (process.env.INTRSPECTION_ENABLED &&
        process.env.INTRSPECTION_ENABLED === "true") ||
      false,
    playgroundEnabled:
      (process.env.PLAYGROUND_ENABLED &&
        process.env.PLAYGROUND_ENABLED === "true") ||
      false
  },

  rediscloudUrl: process.env.REDISCLOUD_URL,

  newBeers: {
    url: process.env.NEW_BEERS_URL || "http://new-beers.ddns.net",
    authUrl:
      process.env.NEW_BEERS_AUTH_URL || "http://data-source.ddns.net/auth"
  },

  elasticsearch: {
    url: process.env.BONSAI_URL || "http://localhost:9200"
  },

  untappd: {
    baseUrl: process.env.UNTAPPED_BASE_URL || "https://api.untappd.com",
    authBaseUrl:
      process.env.UNTAPPED_AUTH_BASE_URL || "https://untappd.com/oauth",
    clientID: process.env.UNTAPPED_CLIENT_ID,
    clientSecret: process.env.UNTAPPED_CLIENT_SECRET
  },

  systembolaget: {
    url:
      process.env.SYSTEMBOLAGET_URL ||
      "http://www.systembolaget.se/api/assortment/products/xml"
  },

  omdb: {
    baseUrl: process.env.UNTAPPED_BASE_URL || "http://www.omdbapi.com",
    apiKey: process.env.OMDB_API_KEY
  }
};
