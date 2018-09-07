import { RESTDataSource } from "apollo-datasource-rest";

class OmdbAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://www.omdbapi.com";
    this.apiKey = process.env.OMDB_API_KEY;
  }

  // https://www.apollographql.com/docs/apollo-server/v2/features/data-sources.html#Intercepting-fetches
  willSendRequest(request) {
    const { method, path, params } = request;
  }

  async getMovie(imdbId) {
    // RESTDataSource do cache responses as defined in the API response cache headers.
    // It does not cache private cache headers.
    // But we can override the TTL (in SEC) with cacheOptions!

    return this.get(
      "/",
      { apikey: this.apiKey, i: imdbId },
      { cacheOptions: { ttl: 3600 } }
    );
  }
}

export default OmdbAPI;
