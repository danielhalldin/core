module.exports = {
  port: process.env.PORT || 5000,
  logLevel: process.env.LOG_LEVEL || "info",

  elasticsearchUrl: process.env.BONSAI_URL || "http://localhost:9200",

  googleApiKey: process.env.GOOGLE_API_KEY,
  googleCseId: process.env.GOOGLE_CSE_ID,

  untappedBaseUrl: process.env.UNTAPPED_BASE_URL || "https://api.untappd.com",
  untappedClientID: process.env.UNTAPPED_CLIENT_ID,
  untappedClientSecret: process.env.UNTAPPED_CLIENT_SECRET,

  systembolagetUrl:
    process.env.SYSTEMBOLAGET_URL ||
    "http://www.systembolaget.se/api/assortment/products/xml",

  omdbBaseUrl: process.env.UNTAPPED_BASE_URL || "http://www.omdbapi.com",
  omdbApiKey: process.env.OMDB_API_KEY || "http://www.omdbapi.com"
};
