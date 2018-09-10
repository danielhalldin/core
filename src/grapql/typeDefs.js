import { gql } from "apollo-server-express";
import untappdTypeDefs from "./beer/typeDefs";
import omdbTypeDefs from "./movie/typeDefs";

export default gql`
  ${untappdTypeDefs}
  ${omdbTypeDefs}

  type Query {
    getMovieById(imdbId: ID!): movieData
    getMovieBySearch(searchString: String!): [movieData]
    getLatestBeers(test: ID): [beer]
    Untappd(query: String!): [beer]
  }
`;
