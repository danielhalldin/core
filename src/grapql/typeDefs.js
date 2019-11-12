import { gql } from "apollo-server-express";
import beerTypeDefs from "./beer/typeDefs";

export default gql`
  ${beerTypeDefs}

  type Query {
    """
    The lates [size] beers of the [stockType] decoreted with untappd data
    """
    decoratedLatest(size: Int, stockType: String): list
    """
    The recommended [size] beers
    """
    recommended(size: Int): list

    systembolagetLatest(size: Int): [beer]
    untappdById(id: ID!): beer
    untappdFriends: [user]
    untappdIsFriend: Boolean
    untappdSearch(query: String!): [beer]
    untappdUser: user
    untappdUserBeers: [beer]
  }

  type Mutation {
    deleteBeer(systembolagetArticleId: Int!): Boolean
    updateUntappdId(systembolagetArticleId: Int!, untappdId: Int!): Boolean
  }
`;
