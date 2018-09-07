module.exports = {
  port: process.env.PORT || 5000,

  elasticsearchUrl: process.env.BONSAI_URL || "http://localhost:9200",

  googleApiKey: process.env.GOOGLE_API_KEY,
  googleCseId: process.env.GOOGLE_CSE_ID,

  untappedClientID: process.env.UNTAPPED_CLIENT_ID,
  untappedClientSecret: process.env.UNTAPPED_CLIENT_SECRET,

  systembolagetUrl:
    process.env.SYSTEMBOLAGET_URL ||
    "http://www.systembolaget.se/api/assortment/products/xml"
};
