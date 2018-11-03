import { RESTDataSource } from "apollo-datasource-rest";
import config from "../../../config";
import logger from "../../logger";
import moment from "moment";
import _get from "lodash/get";
import { set, get, getTtl, setExpireat } from "../../redisClient";

class UntappdAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = config.untappd.baseUrl;
    this.clientSecret = config.untappd.clientSecret;
    this.clientId = config.untappd.clientID;
  }

  willSendRequest(request) {
    return request;
  }

  async didReceiveResponse(response) {
    const currentRemainingRequest = response.headers.get(
      "x-ratelimit-remaining"
    );
    const authType = response.headers.get("x-auth-type");
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

  async search(query) {
    let options = {
      q: query.replace(/\s/g, "+")
    };

    const response = await this.get(
      `/v4/search/beer`,
      this.decorateOptionsWithTokens(options),
      { cacheOptions: { ttl: 3600 * 2 } } // Cache beers for 2 hours
    );

    return response.response.beers.items;
  }

  async byId(id, untappd_access_token) {
    const response = await this.get(
      `/v4/beer/info/${id}`,
      this.decorateOptionsWithTokens({}, untappd_access_token),
      { cacheOptions: { ttl: 3600 * 24 * 5 } } // Cache beers for 5 days
    );

    return response;
  }

  async userBeers(untappd_access_token) {
    const response = await this.get(
      `/v4/user/beers`,
      this.decorateOptionsWithTokens({}, untappd_access_token),
      { cacheOptions: { ttl: 3600 } } // Cache beers 1 hour
    );

    return response.response.beers.items;
  }

  async friends() {
    const response = await this.get(
      `/v4/user/friends/Nexus5`,
      this.decorateOptionsWithTokens({}),
      { cacheOptions: { ttl: 3600 * 24 } } // Cache beers for 1 days
    );

    const friends =
      response.response.items &&
      response.response.items.map(item => {
        return {
          name: item.user.user_name,
          avatar: item.user.user_avatar
        };
      });

    return friends;
  }

  async user(untappd_access_token) {
    let response = await this.get(
      `/v4/user/info#${untappd_access_token}`,
      this.decorateOptionsWithTokens({}, untappd_access_token),
      { cacheOptions: { ttl: 600 } } // Cache user for 10 minutes
    );

    const fallbackUserCacheKey = `fallbackForUser_${untappd_access_token}`;
    let user;

    try {
      user = await response.response.user;
      set(fallbackUserCacheKey, JSON.stringify(response), "EX", 3600); // Fallback cache user for 1 hour
    } catch (e) {
      response = JSON.parse(await get(fallbackUserCacheKey));
      user = response.response.user;
    }

    const checkins = _get(user, ["checkins", "items"], []).map(checkin => {
      return {
        timestamp: checkin.created_at,
        bid: checkin.beer.bid
      };
    });

    checkins.map(async checkin => {
      const key = `httpcache:https://api.untappd.com/v4/beer/info/${
        checkin.bid
      }?access_token=${untappd_access_token}`;
      const ttl = await getTtl(key);
      const timeWhenCached = moment()
        .add(ttl, "second")
        .subtract(3600 * 24 * 5, "second");
      const checkinTime = moment(checkin.timestamp);
      if (timeWhenCached.isBefore(checkinTime) && ttl !== -2) {
        await setExpireat(key, -2);
      }
      return key;
    });

    return {
      name: user.user_name,
      avatar: user.user_avatar,
      totalBeers: user.stats.total_beers,
      checkins: checkins
    };
  }
}

export default UntappdAPI;
