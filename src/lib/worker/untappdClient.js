import config from "../../config";
import fetch from "node-fetch";
import logger from "../logger";

class UntappdClient {
  constructor() {
    this.baseUrl = config.untappedBaseUrl;
    this.untappedClientID = config.untappedClientID;
    this.untappedClientSecret = config.untappedClientSecret;
  }

  searchBeer = async q => {
    const url = `${this.baseUrl}/v4/search/beer?client_id=${
      this.untappedClientID
    }&client_secret=${this.untappedClientSecret}&q=${q.replace(/\s/g, "+")}`;

    const response = await fetch(url);
    logger.info(
      "Remaining Untappd requests: " +
        response.headers.get("x-ratelimit-remaining")
    );
    if (response.headers.get("x-ratelimit-remaining") === "0") {
      throw new Error('Exceeded untappd rate limit searching for: "' + q + '"');
    }

    const data = await response.text();
    const json = await JSON.parse(data);
    return json.response.beers.items;
  };
}

module.exports = UntappdClient;
