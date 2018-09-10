import { RESTDataSource } from "apollo-datasource-rest";
import config from "../../config";

class UntappdAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.untappedBaseUrl;
    this.clientSecret = config.untappedClientSecret;
    this.clientId = config.untappedClientID;
  }

  willSendRequest(request) {}

  async search(query) {
    const response = await this.get(
      "/search/beer",
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        q: query.replace(/\s/g, "+")
      },
      { cacheOptions: { ttl: 3 } }
    );

    const beers = response.response.beers.items;

    return beers;
  }

  async beer(bid) {
    return this.get(
      "/beer/info/",
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        bid
      },
      { cacheOptions: { ttl: 3600 } }
    );
  }
}

export default UntappdAPI;
