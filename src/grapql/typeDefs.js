import { gql } from "apollo-server-express";
import untappdTypeDefs from "./beer/typeDefs";
import omdbTypeDefs from "./movie/typeDefs";

export default gql`
  ${untappdTypeDefs}
  ${omdbTypeDefs}

  type Query {
    Omdb(id: ID!): movieData
    Untappd(query: String!): [beer]
  }
`;
