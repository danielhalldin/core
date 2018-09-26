import { RESTDataSource } from "apollo-datasource-rest";
import moment from "moment";
import config from "../../config";
import _ from "lodash";

import beerQuery from "./queries/beer";

class elasticsearchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.elasticsearchUrl;
  }

  willSendRequest(request) {
    console.log("request", request.body);
    return request;
  }

  async didReceiveResponse(response) {
    const body = await response.json();
    return body;
  }

  async latestBeer(size = 10, stockType = "Små partier") {
    var fromDate = moment().subtract(14, "day");
    var toDate = moment().add(2, "month");

    const response = await this.post(
      `/systembolaget/_search?size=${size}#stockType=${stockType}`,
      beerQuery(fromDate, toDate, stockType),
      { cacheOptions: { ttl: 3600 } }
    );

    return response;
  }
}

export default elasticsearchAPI;
