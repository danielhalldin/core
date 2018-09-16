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
  { size },
  { dataSources, untappd_access_token }
) => {
  const data = await dataSources.ElasticsearchApi.latestBeer(size);
  const beers = data.hits.hits.map(async beer => {
    const systembolagetBeer = systembolagetTransform(beer);
    const query = `${systembolagetBeer.brewery} ${systembolagetBeer.name}`
      .replace("AB", "")
      .replace("Aktiebryggeri", "")
      .replace("IPA", "");
    const untappdSearchResult = await dataSources.UntappdAPI.search(
      query,
      untappd_access_token
    );
    if (untappdSearchResult.length > 0) {
      return Object.assign(
        {},
        systembolagetBeer,
        untappdTransform(untappdSearchResult[0])
      );
    } else {
      const untappdSearchResult = await dataSources.UntappdAPI.search(
        systembolagetBeer.name.replace(systembolagetBeer.brewery, ""),
        untappd_access_token
      );
      if (untappdSearchResult.length > 0) {
        return Object.assign(
          {},
          systembolagetBeer,
          untappdTransform(untappdSearchResult[0])
        );
      }
    }
    console.log(
      "NO MATCH FOUND",
      "systembolaget name:",
      systembolagetBeer.name,
      " - ",
      systembolagetBeer.brewery
    );
    return systembolagetBeer;
  });

  return beers;
};

export { untappdSearch, systembolagetLatest, untappdById, decoratedLatest };
