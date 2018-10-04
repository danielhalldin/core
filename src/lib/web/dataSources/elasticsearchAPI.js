import { RESTDataSource } from "apollo-datasource-rest";
import moment from "moment";
import config from "../../../config";

import { beers } from "../../queries/beer";

class elasticsearchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.elasticsearch.url;
  }

  willSendRequest(request) {
    return request;
  }

  async didReceiveResponse(response) {
    const body = await response.json();
    return body;
  }

  async latestBeer(size = 10, stockType = "Små partier") {
    var fromDate = moment().subtract(1, "month");
    var toDate = moment().add(1, "month");

    const response = await this.post(
      `/systembolaget/_search?size=${size}#stockType=${stockType}`,
      beers(fromDate, toDate, stockType),
      { cacheOptions: { ttl: 10 } }
    );

    return response;
  }
}

export default elasticsearchAPI;
