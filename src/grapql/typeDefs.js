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
    untappdUserBeers: [beer]
    untappdById(id: ID!): beer
    untappdUser: user
    untappdFriends: [user]
    untappdIsFriend: Boolean
    decoratedLatest(size: Int, stockType: String): list
    recommended(size: Int): list
  }

  type Mutation {
    updateUntappdId(systembolagetArticleId: Int!, untappdId: Int!): Boolean
    deleteBeer(systembolagetArticleId: Int!): Boolean
  }
`;
