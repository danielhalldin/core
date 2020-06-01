export default `
  """
  A type that describes a beer.
  """
  type beer {
    abv: Float
    beerLabel: String
    brewery: String
    breweryLabel: String
    category: String
    checkinDate: String
    country: String
    description: String
    ibu: Int
    id: Int
    name: String
    price: Float
    rating: Float
    salesStartDate: String
    stockType: String
    stockTypeId: String
    style: String
    supplier: String
    systembolagetArticleId: Int
    systembolagetId: Int
    systembolagetUrl: String 
    type: String
    untappdDeepLink: String
    untappdId: Int
    untappdUrl: String
    userRating: Float
    volume: Float
  }

  """
  A type that describes a user.
  """
  type user {
    admin: Boolean
    avatar: String
    name: String 
    totalBeers: Int
  }

  """
  A type that describes a named list of beers.
  """
  type list {
    beers: [beer]
    name: String
  }

  """
  A type that describes a stock.
  """
  type stock {
    name: String
    nrOfBeers: Int
    nextRelease: String
    nextReleaseTimestamp: Int
  }
`;
