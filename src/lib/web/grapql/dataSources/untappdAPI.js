import { RESTDataSource } from 'apollo-datasource-rest';
import config from '../../../../config';
import logger from '../../../logger';
import moment from 'moment';
import _get from 'lodash/get';
import RedisClient from '../../../worker/clients/redisClient';

const CACHE_TIME = {
  USER_BEERS: 3600,
  BY_ID: 3600 * 24 * 5,
  FALLBACK_USER: 3600,
  SEARCH: 3600 * 2,
  FRIENDS: 3600 * 24,
  USER: 3600
};

class UntappdAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.untappd.baseUrl;
    this.clientSecret = config.untappd.clientSecret;
    this.clientId = config.untappd.clientID;
    this.redisClient = new RedisClient();
  }

  willSendRequest(request) {
    return request;
  }

  async didReceiveResponse(response) {
    const currentRemainingRequest = response.headers.get('x-ratelimit-remaining');
    const authType = response.headers.get('x-auth-type');
    logger.debug(`Remaining request, ${currentRemainingRequest}, ${authType}`);
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

  async flushCache({ flushBeforeTimestamp, cacheKey, cacheKeyCacheTime }) {
    const flushBeforeTime = moment(flushBeforeTimestamp);
    const cacheKeyTtl = await this.redisClient.getTtl(cacheKey);
    const cacheKeyTimeWhenCached = moment()
      .add(cacheKeyTtl, 'second')
      .subtract(cacheKeyCacheTime, 'second');
    if (cacheKeyTimeWhenCached.isBefore(flushBeforeTime) && cacheKeyTtl !== -2) {
      await this.redisClient.setExpireat(cacheKey, -2);
    }
  }

  async search(query) {
    let options = {
      q: query.replace(/\s/g, '+')
    };

    const response = await this.get(
      `/v4/search/beer`,
      this.decorateOptionsWithTokens(options),
      { cacheOptions: { ttl: CACHE_TIME.SEARCH } } // Cache beers for 2 hours
    );

    return response.response.beers.items;
  }

  async byId(id, untappd_access_token) {
    const response = await this.get(
      `/v4/beer/info/${id}`,
      this.decorateOptionsWithTokens({ compact: true }, untappd_access_token),
      { cacheOptions: { ttl: CACHE_TIME.BY_ID } }
    );

    return response;
  }

  async userBeers(untappd_access_token) {
    const response = await this.get(
      `/v4/user/beers?limit=50`,
      this.decorateOptionsWithTokens({}, untappd_access_token),
      { cacheOptions: { ttl: CACHE_TIME.USER_BEERS } }
    );

    const items = _get(response, 'response.beers.items') || null;

    return items;
  }

  async friends() {
    const response = await this.get(
      `/v4/user/friends/${config.superUser}`,
      this.decorateOptionsWithTokens({}),
      { cacheOptions: { ttl: CACHE_TIME.FRIENDS } } // Cache beers for 1 days
    );

    const items = _get(response, 'response.items') || [];
    const friends = items.map(item => {
      return {
        name: _get(item, 'user.user_name') || null,
        avatar: _get(item, 'user.user_avatar') || null
      };
    });

    return friends;
  }

  async user(untappd_access_token) {
    let response = await this.get(
      `/v4/user/info`,
      this.decorateOptionsWithTokens({ compact: false }, untappd_access_token),
      { cacheOptions: { ttl: CACHE_TIME.USER } } // Cache user for 10 minutes
    );

    const fallbackUserCacheKey = `fallbackForUser_${untappd_access_token}`;
    let user;

    try {
      user = await response.response.user;
      this.redisClient.set(fallbackUserCacheKey, JSON.stringify(response), 'EX', CACHE_TIME.FALLBACK_USER); // Fallback cache user for 1 hour
    } catch (e) {
      response = JSON.parse(await this.redisClient.get(fallbackUserCacheKey));
      user = response.response.user;
    }

    const checkins = _get(user, ['checkins', 'items'], []).map(checkin => {
      return {
        timestamp: checkin.created_at,
        bid: checkin.beer.bid
      };
    });

    // FLUSH CACHES IF RECENT CHECKINS
    checkins.map(async checkin => {
      // Checkin
      const checkinTime = moment(checkin.timestamp);
      //Beer
      const beerCacheKey = `httpcache:https://api.untappd.com/v4/beer/info/${checkin.bid}?compact=true&access_token=${untappd_access_token}`;
      this.flushCache({
        flushBeforeTimestamp: checkinTime,
        cacheKey: beerCacheKey,
        cacheKeyCacheTime: CACHE_TIME.BY_ID
      });
      // UserBeers
      const userBeersCacheKey = `httpcache:https://api.untappd.com/v4/user/beers?limit=50&access_token=${untappd_access_token}`;
      this.flushCache({
        flushBeforeTimestamp: checkinTime,
        cacheKey: userBeersCacheKey,
        cacheKeyCacheTime: CACHE_TIME.USER_BEERS
      });
    });

    return {
      name: _get(user, 'user_name') || null,
      avatar: _get(user, 'user_avatar') || null,
      totalBeers: _get(user, 'stats.total_beers') || null,
      checkins: checkins
    };
  }
}

export default UntappdAPI;
