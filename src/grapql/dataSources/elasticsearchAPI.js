import { RESTDataSource } from "apollo-datasource-rest";
import config from "../../config";

class elasticsearchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.elasticsearchUrl;
  }

  willSendRequest(request) {}

  async getLatestBeer() {
    return this.get(
      "/systembolaget/_search",
      {},
      {
        cacheOptions: { ttl: 3600 }
      }
    );
  }
}

export default elasticsearchAPI;
