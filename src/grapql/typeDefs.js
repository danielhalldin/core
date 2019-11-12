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

    """
    The [size] latest beers from systembolaget
    """
    systembolagetLatest(size: Int): [beer]

    """
    Search untappd using the [id]
    """
    untappdById(id: ID!): beer

    """
    The users friends
    """
    untappdFriends: [user]

    """
    Check if the user is a friend to the admin
    """
    untappdIsFriend: Boolean

    """
    Search untappd using a [query]
    """
    untappdSearch(query: String!): [beer]

    """
    The untappd user
    """
    untappdUser: user

    """
    The users latest checkins
    """
    untappdUserBeers: [beer]
  }

  type Mutation {
    """
    Delete the beer with [systembolagetArticleId]
    """
    deleteBeer(systembolagetArticleId: Int!): Boolean

    """
    Set [untappdId] on beer with [systembolagetArticleId]
    """
    updateUntappdId(systembolagetArticleId: Int!, untappdId: Int!): Boolean
  }
`;
