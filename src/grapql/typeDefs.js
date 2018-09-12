import { gql } from "apollo-server-express";
import untappdTypeDefs from "./Untappd/typeDefs";
import omdbTypeDefs from "./Omdb/typeDefs";

export default gql`
  ${untappdTypeDefs}
  ${omdbTypeDefs}

  type Query {
    getMovieById(imdbId: ID!): movieData
    getMovieBySearch(searchString: String!): [movieData]
    latestBeers(size: Int): [beer]
    Untappd(query: String!): [beer]
  }
`;
