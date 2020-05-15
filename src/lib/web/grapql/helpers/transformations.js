import moment from 'moment';

const untappdTransform = (data) => {
  if (!data) {
    return;
  }
  if (data.beer && data.brewery) {
    return Object.assign({}, untappdTransformBeer(data.beer), untappdTransformBrewery(data.brewery));
  } else {
    return Object.assign({}, untappdTransformBeer(data), untappdTransformBrewery(data.brewery));
  }
};

const untappdTransformBeer = (data) => {
  const {
    auth_rating: userRating,
    rating_score: rating,
    beer_name: name,
    beer_label_hd: beerLabelHD,
    beer_label: beerLabel,
    beer_ibu: ibu,
    beer_abv: abv,
    beer_style: style,
    beer_description: description,
    bid: untappdId,
    beer_slug,
    checkinDate,
  } = data;

  return {
    id: untappdId,
    userRating,
    rating,
    name,
    beerLabel: beerLabelHD || beerLabel,
    ibu,
    abv,
    style,
    description,
    untappdId,
    untappdUrl: checkinDate ? `https://untappd.com/c/${untappdId}` : `https://untappd.com/b/${beer_slug}/${untappdId}`,
    untappdDeepLink: checkinDate ? `untappd://checkin/${untappdId}` : `untappd://beer/${untappdId}`,
    checkinDate: checkinDate && moment(checkinDate).format('YYYY-MM-DD'),
  };
};

const untappdTransformBrewery = (data) => {
  try {
    const { brewery_name: brewery, brewery_label: breweryLabel, country_name: country } = data;
    return {
      brewery,
      breweryLabel,
      country,
    };
  } catch (e) {
    console.log(e);
  }
};

const systembolagetTransform = (data) => {
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
    Saljstart: salesStartDate,
    Ursprunglandnamn: countryName,
    Ursprung: countryRegion,
    Sortiment: stockTypeId,
    SortimentText: stockType,
    nr: systembolagetId,
    Artikelid: systembolagetArticleId,
    untappdData,
  } = data._source;
  const {
    beer_label_hd: beerLabelHD = undefined,
    beer_label: beerLabel = undefined,
    beer_name: untappdBeerNamne = undefined,
    beer_abv: untappdAbv = undefined,
    beer_style: untappdStyle,
    rating_score: rating = undefined,
    bid: untappdId = undefined,
    beer_slug = undefined,
    beer_ibu: ibu = undefined,
    beer_description: description = undefined,
  } = untappdData || {};

  return {
    id: systembolagetId,
    name: untappdBeerNamne || `${name}${name2 ? ' ' + name2 : ''}`,
    brewery: brewery || 'N/A',
    description,
    rating,
    ibu,
    price,
    category,
    style: untappdStyle || style,
    type,
    abv: untappdAbv || abv.replace(/(\d+\.)(\d)\d*%/, '$1$2'),
    supplier,
    volume,
    salesStartDate,
    country: `${countryName}${countryRegion ? ' - ' + countryRegion : ''}`,
    stockTypeId,
    stockType,
    systembolagetId,
    systembolagetArticleId,
    systembolagetUrl: `https://www.systembolaget.se/${systembolagetId}`,
    untappdId,
    beerLabel: beerLabelHD || beerLabel,
    untappdDeepLink: untappdId && `untappd://beer/${untappdId}`,
    untappdUrl: untappdId && beer_slug && `https://untappd.com/b/${beer_slug}/${untappdId}`,
  };
};

export { untappdTransform, systembolagetTransform };
