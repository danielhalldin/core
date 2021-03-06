import { RESTDataSource } from 'apollo-datasource-rest';
import moment from 'moment';
import config from '../../../../config';

import { beers, recommendedBeers, searchBeers, stock, beerFromBID } from '../../../queries/beer';

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

  async latestBeer({ size, stockType }) {
    const fromDate = moment().subtract(10, 'year');
    const toDate = moment().add(1, 'month');

    const response = await this.post(
      `/systembolaget/_search?size=${size}#stockType=${stockType}`,
      beers({ fromDate, toDate, stockType }),
      {
        cacheOptions: { ttl: 10 }
      }
    );

    return response;
  }

  async recommendedBeer({ size }) {
    var fromDate = moment().subtract(1, 'month');
    var toDate = moment().add(1, 'month');

    const response = await this.post(`/systembolaget/_search?size=${size}`, recommendedBeers({ fromDate, toDate }), {
      cacheOptions: { ttl: 10 }
    });

    return response;
  }

  async beerFromBID({ BIDs }) {
    const response = await this.post(`/systembolaget/_search?size=200`, beerFromBID({ BIDs }), {
      cacheOptions: { ttl: 10 }
    });

    return response;
  }

  async searchBeer({ size, searchString, searchType, sortType }) {
    const response = await this.post(
      `/systembolaget/_search?size=${size}`,
      searchBeers({ searchString, searchType, sortType }),
      {
        cacheOptions: { ttl: 10 }
      }
    );

    return response;
  }

  async stock() {
    const response = await this.post(`/systembolaget/_search?size=0`, stock(), {
      cacheOptions: { ttl: 60 * 60 }
    });

    return response;
  }
}

export default elasticsearchAPI;
