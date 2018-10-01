import Elasticsearch from "elasticsearch";
import URI from "urijs";
import moment from "moment";
import config from "../../config";
import { beersToDecorate } from "../queries/beer";

class SearchClient {
  constructor() {
    const uri = new URI(config.elasticsearch.url);
    this._client = new Elasticsearch.Client({
      host: uri.toString(),
      apiVersion: "5.0"
    });
  }

  search = query => {
    return this._client.search(query);
  };

  latatestBeersToBeDecorated = async ({
    size = 1,
    stockType = "Små partier"
  }) => {
    var fromDate = moment().subtract(1, "month");
    var toDate = moment().add(1, "month");
    const queryBody = beersToDecorate(fromDate, toDate, stockType);
    const query = {
      index: ["systembolaget"],
      size: size,
      body: queryBody
    };

    const response = await this.search(query);
    return response.hits.hits;
  };
}

export default SearchClient;
