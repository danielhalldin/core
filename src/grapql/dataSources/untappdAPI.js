import { RESTDataSource } from "apollo-datasource-rest";
import config from "../../config";
import logger from "../../lib/logger";

class UntappdAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.untappd.baseUrl;
    this.clientSecret = config.untappd.clientSecret;
    this.clientId = config.untappd.clientID;
  }

  willSendRequest(request) {
    return request;
  }

  async didReceiveResponse(response) {
    const currentRemainingRequest = response.headers.get(
      "x-ratelimit-remaining"
    );
    const authType = response.headers.get("x-auth-type");
    logger.info("Remaining request", currentRemainingRequest, authType);
    return response.json();
  }

  decorateOptionsWithTokens(options, untappd_access_token) {
    if (!untappd_access_token) {
      options.client_id = this.clientId;
      options.client_secret = this.clientSecret;
    } else {
      options.access_token = untappd_access_token;
    }
    return options;
  }

  async search(query) {
    let options = {
      q: query.replace(/\s/g, "+")
    };

    const response = await this.get(
      `/v4/search/beer`,
      this.decorateOptionsWithTokens(options),
      { cacheOptions: { ttl: 3600 * 2 } }
    );

    return response.response.beers.items;
  }

  async byId(id, untappd_access_token) {
    const response = await this.get(
      `/v4/beer/info/${id}`,
      this.decorateOptionsWithTokens({}, untappd_access_token),
      { cacheOptions: { ttl: 3600 * 2 } }
    );

    return response;
  }
}

export default UntappdAPI;
