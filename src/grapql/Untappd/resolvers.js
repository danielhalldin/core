const searchBeer = async (obj, { query }, { dataSources }) => {
  const data = await dataSources.UntappdAPI.search(query);
  const beers = data.map(item => {
    const {
      beer_name: name,
      beer_label: beerLabel,
      beer_ibu: ibu,
      beer_abv: abv,
      beer_style: style,
      beer_description: description,
      bid: untappdId
    } = item.beer;
    const {
      brewery_name: brewery,
      brewery_label: breweryLabel,
      brewery_country: country
    } = item.brewery;
    return {
      name,
      brewery,
      beerLabel,
      breweryLabel,
      ibu,
      abv,
      style,
      country,
      description,
      untappdId
    };
  });

  return beers;
};

export default searchBeer;
