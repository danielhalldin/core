import { gql } from "apollo-server-express";

export default gql`
  type movieData {
    title: String
    imdb: String
    rottenTomatoes: String
    metacritic: String
  }

  type Query {
    Omdb(id: ID!): movieData
  }
`;
