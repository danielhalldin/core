import { RESTDataSource } from "apollo-datasource-rest";
import moment from "moment";
import config from "../../config";
import _ from "lodash";

class elasticsearchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.elasticsearchUrl;
  }

  willSendRequest(request) {}

  async latestBeer(size = 10) {
    var fromDate = moment().subtract(14, "day");
    var sort = ["-Saljstart"].map(function(item) {
      var order = _.startsWith(item, "-") ? "desc" : "asc";
      var object = {};
      object[_.trim(item, "+-")] = {
        order: order
      };
      return object;
    });

    console.log("sort", sort);
    return this.post(
      `/systembolaget/_search?size=${size}`,
      {
        sort: sort,
        query: {
          bool: {
            filter: {
              bool: {
                must: [
                  { match: { Varugrupp: "öl" } },
                  // { match: { SortimentText: "Små partier" } },
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
