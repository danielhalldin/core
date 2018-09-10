const getLatestBeers = async (obj, { test }, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.getLatestBeer(test);
  const beers = data.hits.hits.map(item => {
    return {
      name: item._source.Namn,
      brewery: item._source.Producent
    };
  });

  return beers;
};

export default getLatestBeers;
