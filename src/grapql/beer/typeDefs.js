export default `
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

  type user {
    name: String 
    avatar: String
    totalBeers: Int
    admin: Boolean
  }

  type list {
    name: String
    beers: [beer]
  }
`;
