import { RESTDataSource } from "apollo-datasource-rest";
import moment from "moment";
import config from "../../config";

class elasticsearchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.elasticsearchUrl;
  }

  willSendRequest(request) {}

  async latestBeer(size = 10) {
    var fromDate = moment().subtract(14, "day");
    return this.post(
      `/systembolaget/_search?size=${size}`,
      {
        query: {
          bool: {
            filter: {
              bool: {
                must: [
                  { match: { Varugrupp: "öl" } },
                  {
                    range: {
                      Saljstart: {
                        gte: fromDate
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        cacheOptions: { ttl: 3600 }
      }
    );
  }
}

export default elasticsearchAPI;
