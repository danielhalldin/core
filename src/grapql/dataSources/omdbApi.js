import { RESTDataSource } from "apollo-datasource-rest";
import config from "../../config";

class OmdbAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.omdb.baseUrl;
    this.apiKey = config.omdb.apiKey;
  }

  // https://www.apollographql.com/docs/apollo-server/v2/features/data-sources.html#Intercepting-fetches
  willSendRequest(request) {}

  async getMovieById(imdbId) {
    // RESTDataSource do cache responses as defined in the API response cache headers.
    // It does not cache private cache headers.
    // But we can override the TTL (in SEC) with cacheOptions!

    return this.get(
      "/",
      { apikey: this.apiKey, i: imdbId },
      { cacheOptions: { ttl: 3600 } }
    );
  }

  async getMovieBySearch(searchString) {
    return this.get(
      "/",
      { apikey: this.apiKey, s: searchString },
      { cacheOptions: { ttl: 3600 } }
    );
  }
}

export default OmdbAPI;
