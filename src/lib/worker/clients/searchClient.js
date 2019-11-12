import Elasticsearch from 'elasticsearch';
import URI from 'urijs';
import moment from 'moment';
import config from '../../../config';
import { beers } from '../../queries/beer';

class SearchClient {
  constructor() {
    const uri = new URI(config.elasticsearch.url);
    this._client = new Elasticsearch.Client({
      host: uri.toString(),
      apiVersion: '5.6'
    });
  }

  search = query => {
    return this._client.search(query);
  };

  latatestBeersToBeDecorated = async ({ size = 50, stockType = 'Tillfälligt sortiment' }) => {
    var fromDate = moment().subtract(10, 'year');
    var toDate = moment().add(1, 'month');
    const queryBody = beers({ fromDate, toDate, stockType });
    const query = {
      index: ['systembolaget'],
      size: size,
      body: queryBody
    };

    const response = await this.search(query);
    return response.hits.hits;
  };
}

export default SearchClient;
