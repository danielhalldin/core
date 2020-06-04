import { untappdTransform, systembolagetTransform } from './helpers/transformations';
import config from '../../../config';
import { get as _get, orderBy } from 'lodash';
import moment from 'moment';

const decoratedLatest = async (
  _,
  { size, stockType = 'Tillfälligt sortiment' },
  { dataSources, untappd_access_token }
) => {
  let sortedBeers = [];
  try {
    const data = await dataSources.ElasticsearchApi.latestBeer({
      size,
      stockType
    });
    const _beers = _get(data, 'hits.hits', []).map(async beer => {
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
    sortedBeers = orderBy(
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
  } catch (e) {
    console.log(e);
  }

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

const systembolagetSearch = async (_obj, { size, searchString, searchType, sortType }, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.searchBeer({ size, searchString, searchType, sortType });
  const beers = data.hits.hits.map(beer => {
    return systembolagetTransform(beer);
  });

  return beers;
};

const systembolagetStock = async (_obj, _args, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.stock();
  const stockCategories = data.aggregations.stock.buckets
    .sort(function(a, b) {
      return b.maxSalesStartDate.value - a.maxSalesStartDate.value;
    })
    .map(category => {
      return {
        name: category.key,
        nrOfBeers: category.doc_count,
        nextRelease: moment(category.maxSalesStartDate.value).format('MM/DD')
      };
    });

  return stockCategories;
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
    id: data.id,
    name: data.name,
    avatar: data.avatar,
    totalBeers: data.totalBeers,
    admin: data.name === config.superUser
  };
};

const untappdIsFriend = async (_, _params, { dataSources, untappd_access_token }) => {
  const superUserfriends = await dataSources.UntappdAPI.friends();
  const user = await dataSources.UntappdAPI.user(untappd_access_token);
  if (config.superUser === user.name) {
    // Self
    return true;
  }
  return !!superUserfriends.find(friend => friend.name === user.name);
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
  systembolagetSearch,
  systembolagetStock,
  untappdById,
  decoratedLatest,
  recommended,
  untappdUser,
  untappdUserBeers,
  untappdFriends,
  untappdIsFriend
};
