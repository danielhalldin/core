import { untappdTransform, systembolagetTransform } from './helpers/transformations';
import config from '../../../config';
import { orderBy } from 'lodash';

const decoratedLatest = async (
  _,
  { size, stockType = 'Tillfälligt sortiment' },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.ElasticsearchApi.latestBeer({
    size,
    stockType
  });
  const _beers = data.hits.hits.map(async beer => {
    const systembolagetBeer = systembolagetTransform(beer);
    const untappdId = beer._source.untappdId;
    let untappdBeer;
    if (untappdId) {
      const personalBeerData = await dataSources.UntappdAPI.byId(untappdId, untappd_access_token);
      if (personalBeerData.response.beer) {
        untappdBeer = untappdTransform(personalBeerData.response.beer);
      } else {
        untappdBeer = untappdTransform(beer._source.untappdData);
      }
    }
    return Object.assign({}, systembolagetBeer, untappdBeer);
  });
  const beers = await Promise.all(_beers);
  const sortedBeers = orderBy(
    beers,
    [
      'salesStartDate',
      beer => {
        return beer.rating || -1;
      },
      'name'
    ],
    ['desc', 'desc', 'asc']
  );

  return {
    name: stockType,
    beers: sortedBeers
  };
};

const recommended = async (_, { size }, { dataSources, untappd_access_token }) => {
  const data = await dataSources.ElasticsearchApi.recommendedBeer({
    size
  });
  const beers = data.hits.hits.map(async beer => {
    const systembolagetBeer = systembolagetTransform(beer);
    const untappdId = beer._source.untappdId;
    let untappdBeer;
    if (untappdId) {
      const personalBeerData = await dataSources.UntappdAPI.byId(untappdId, untappd_access_token);

      if (personalBeerData.response.beer) {
        untappdBeer = untappdTransform(personalBeerData.response.beer);
      } else {
        untappdBeer = untappdTransform(beer._source.untappdData);
      }
    }
    return Object.assign({}, systembolagetBeer, untappdBeer);
  });

  return {
    name: 'Rekommenderade',
    beers: beers
  };
};
const systembolagetLatest = async (_obj, { size }, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.latestBeer({ size });
  const beers = data.hits.hits.map(beer => {
    return systembolagetTransform(beer);
  });

  return beers;
};

const untappdById = async (_, { id }, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.byId(id, untappd_access_token);
  return untappdTransform(data.response.beer);
};

const untappdFriends = async (_, _params, { dataSources }) => {
  const data = await dataSources.UntappdAPI.friends();
  return data;
};

const untappdUser = async (_, _params, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.user(untappd_access_token);

  return {
    name: data.name,
    avatar: data.avatar,
    totalBeers: data.totalBeers,
    admin: data.name === config.superUser
  };
};

const untappdIsFriend = async (_, _params, { dataSources, untappd_access_token }) => {
  const friends = await dataSources.UntappdAPI.friends();
  const user = await dataSources.UntappdAPI.user(untappd_access_token);

  return !!friends.find(friend => friend.name === user.name);
};

const untappdSearch = async (_, { query }, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.search(query, untappd_access_token);
  const beers = data.map(item => {
    return untappdTransform(item);
  });

  return beers;
};

const untappdUserBeers = async (_, _params, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.userBeers(untappd_access_token);
  const beers = data
    .map(item => {
      return Object.assign({}, item, {
        beer: {
          ...item.beer,
          bid: item.first_checkin_id,
          auth_rating: item.rating_score,
          checkinDate: item.recent_created_at
        }
      });
    })
    .map(item => untappdTransform(item));

  return beers;
};

export {
  untappdSearch,
  systembolagetLatest,
  untappdById,
  decoratedLatest,
  recommended,
  untappdUser,
  untappdUserBeers,
  untappdFriends,
  untappdIsFriend
};
