const searchBeer = async (obj, { query }, { dataSources }) => {
  const data = await dataSources.UntappdAPI.search(query);
  const beers = data.map(item => {
    return {
      name: item.beer.beer_name,
      brewery: item.brewery.brewery_name,
      beerLabel: item.beer.beer_label,
      breweryLabel: item.brewery.brewery_label
    };
  });

  return beers;
};

export default searchBeer;
