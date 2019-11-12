import { gql } from "apollo-server-express";
import beerTypeDefs from "./beer/typeDefs";

export default gql`
  ${beerTypeDefs}

  type Query {
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
