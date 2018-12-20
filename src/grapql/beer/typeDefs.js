export default `
  """
  A type that describes a beer.
  """
  type beer {
    id: Int
    name: String
    brewery: String
    beerLabel: String
    breweryLabel: String
    price: Float
    category: String
    style: String
    type: String
    abv: Float
    ibu: Int
    supplier: String
    volume: Float
    description: String
    country: String
    untappdId: Int
    untappdUrl: String
    untappdDeepLink: String
    userRating: Float
    rating: Float
    salesStartDate: String
    stockTypeId: String
    stockType: String
    systembolagetId: Int
    systembolagetArticleId: Int
    systembolagetUrl: String 
    checkinDate: String
  }

  """
  A type that describes a user.
  """
  type user {
    name: String 
    avatar: String
    totalBeers: Int
    admin: Boolean
  }

  """
  A type that describes a named list of beers.
  """
  type list {
    name: String
    beers: [beer]
  }
`;
