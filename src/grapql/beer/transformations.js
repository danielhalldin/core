const untappdTransform = data => {
  if (data.beer && data.brewery) {
    return Object.assign(
      {},
      untappdTransformBeer(data.beer),
      untappdTransformBrewery(data.brewery)
    );
  } else {
    return Object.assign(
      {},
      untappdTransformBeer(data),
      untappdTransformBrewery(data.brewery)
    );
  }
};

const untappdTransformBeer = data => {
  const {
    auth_rating: userRating,
    beer_name: name,
    beer_label: beerLabel,
    beer_ibu: ibu,
    beer_abv: abv,
    beer_style: style,
    beer_description: description,
    bid: untappdId
  } = data;

  return {
    userRating,
    name,
    beerLabel,
    ibu,
    abv,
    style,
    description,
    untappdId
  };
};

const untappdTransformBrewery = data => {
  const {
    brewery_name: brewery,
    brewery_label: breweryLabel,
    brewery_country: country
  } = data;

  return {
    brewery,
    breweryLabel,
    country
  };
};

const systembolagetTransform = data => {
  const {
    Namn: name,
    Namn2: name2,
    Producent: brewery,
    Prisinklmoms: price,
    Sortiment: category,
    Stil: style,
    Typ: type,
    Alkoholhalt: abv,
    Leverantor: supplier,
    Volymiml: volume,
    Saljstart: salesStartDate
  } = data._source;
  return {
    name: `${name}${name2 ? " " + name2 : ""}`,
    brewery,
    price,
    category,
    style,
    type,
    abv: abv.replace(/(\d+\.)(\d)\d*%/, "$1$2"),
    supplier,
    volume,
    salesStartDate
  };
};

export { untappdTransform, systembolagetTransform };
