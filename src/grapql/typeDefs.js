import { gql } from "apollo-server-express";
import beerTypeDefs from "./beer/typeDefs";
import movieTypeDefs from "./movie/typeDefs";

export default gql`
  ${beerTypeDefs}
  ${movieTypeDefs}

  type Query {
    omdbById(imdbId: ID!): movieData
    omdbBySearch(searchString: String!): [movieData]
    systembolagetLatest(size: Int): [beer]
    untappdSearch(query: String!): [beer]
    untappdById(id: ID!): beer
    decoratedLatest(size: Int): [beer]
  }
`;
