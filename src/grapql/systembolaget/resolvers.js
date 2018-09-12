const getLatestBeers = async (obj, { size }, { dataSources }) => {
  const data = await dataSources.ElasticsearchApi.latestBeer(size);
  const beers = data.hits.hits.map(item => {
    const {
      Namn: name,
      Producent: brewery,
      Prisinklmoms: price,
      Sortiment: category,
      Stil: style,
      Typ: type,
      Alkoholhalt: abv,
      Leverantor: supplier,
      Volymiml: volume
    } = item._source;
    return {
      name,
      brewery,
      price,
      category,
      style,
      type,
      abv,
      supplier,
      volume
    };
  });

  return beers;
};

export default getLatestBeers;
