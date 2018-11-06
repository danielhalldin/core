import { untappdTransform, systembolagetTransform } from "./transformations";
import IndexClient from "../../lib/worker/clients/indexClient";

const untappdById = async (
  _,
  { id },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.byId(id, untappd_access_token);
  return untappdTransform(data.response.beer);
};

const untappdUser = async (
  _,
  params,
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.user(untappd_access_token);

  return {
    name: data.name,
    avatar: data.avatar,
    totalBeers: data.totalBeers
  };
};

const untappdFriends = async (_, params, { dataSources }) => {
  const data = await dataSources.UntappdAPI.friends();
  return data;
};

const untappdIsFriend = async (
  _,
  params,
  { dataSources, untappd_access_token }
) => {
  const friends = await dataSources.UntappdAPI.friends();
  const user = await dataSources.UntappdAPI.user(untappd_access_token);

  return !!friends.find(friend => friend.name === user.name);
};

const untappdSearch = async (
  _,
  { query },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.search(query, untappd_access_token);
  const beers = data.map(item => {
    return untappdTransform(item);
  });

  return beers;
};

const untappdUserBeers = async (
  _,
  params,
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.userBeers(untappd_access_token);
  const beers = data
    .map(item => {
      return Object.assign({}, item, {
        beer: {
          ...item.beer,
          auth_rating: item.rating_score,
          checkinDate: item.recent_created_at
        }
      });
    })
    .map(item => untappdTransform(item));

  return beers;
};

const systembolagetLatest = async (obj, { size }, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.latestBeer(size);
  const beers = data.hits.hits.map(beer => {
    return systembolagetTransform(beer);
  });

  return beers;
};

const decoratedLatest = async (
  _,
  { size, stockType = "Små partier" },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.ElasticsearchApi.latestBeer({
    size,
    stockType
  });
  const beers = data.hits.hits.map(async beer => {
    const systembolagetBeer = systembolagetTransform(beer);
    const untappdId = beer._source.untappdId;
    let untappdBeer;
    if (untappdId) {
      const personalBeerData = await dataSources.UntappdAPI.byId(
        untappdId,
        untappd_access_token
      );
      if (personalBeerData.response.beer) {
        untappdBeer = untappdTransform(personalBeerData.response.beer);
      } else {
        untappdBeer = untappdTransform(beer._source.untappdData);
      }
    }
    return Object.assign({}, systembolagetBeer, untappdBeer);
  });

  return {
    name: stockType,
    beers: beers
  };
};

const updateUntappdId = async (
  _,
  { systembolagetId, untappdId },
  dataSources
) => {
  if (systembolagetId) {
    const indexClient = new IndexClient();
    const responseData = await indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: systembolagetId,
      documentBody: {
        untappdId: Number(untappdId),
        untappdData: null
      }
    });
    if (responseData) {
      return true;
    } else {
      return false;
    }
  }

  return false;
};

export {
  untappdSearch,
  systembolagetLatest,
  untappdById,
  decoratedLatest,
  untappdUser,
  untappdUserBeers,
  untappdFriends,
  untappdIsFriend,
  updateUntappdId
};
