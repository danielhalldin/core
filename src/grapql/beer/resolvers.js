import { untappdTransform, systembolagetTransform } from "./transformations";

const untappdById = async (
  obj,
  { id },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.byId(id, untappd_access_token);

  return untappdTransform(data.response.beer);
};

const untappdSearch = async (
  obj,
  { query },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.UntappdAPI.search(query, untappd_access_token);
  const beers = data.map(item => {
    return untappdTransform(item);
  });

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
  obj,
  { size, stockType },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.ElasticsearchApi.latestBeer(size, stockType);
  const beers = data.hits.hits.map(async beer => {
    const systembolagetBeer = systembolagetTransform(beer);
    const untappdId = beer._source.untappdId;
    let untappdBeer;
    if (untappdId) {
      const personalBeerData = await dataSources.UntappdAPI.byId(
        untappdId,
        untappd_access_token
      );

      if (personalBeerData) {
        untappdBeer = untappdTransform(personalBeerData.response.beer);
      } else {
        untappdBeer = untappdTransform(beer._source.untappdData);
      }
    }

    return Object.assign({}, systembolagetBeer, untappdBeer);
  });

  return beers;
};

export { untappdSearch, systembolagetLatest, untappdById, decoratedLatest };
