import { makeExecutableSchema } from "apollo-server-express";
import {
  decoratedLatest,
  deleteBeer,
  recommended,
  systembolagetLatest,
  untappdById,
  untappdFriends,
  untappdIsFriend,
  untappdSearch,
  untappdUser,
  untappdUserBeers,
  updateUntappdId
} from "./beer/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    decoratedLatest,
    recommended,
    systembolagetLatest,
    untappdById,
    untappdFriends,
    untappdIsFriend,
    untappdSearch,
    untappdUser,
    untappdUserBeers
  },
  Mutation: {
    deleteBeer,
    updateUntappdId
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
