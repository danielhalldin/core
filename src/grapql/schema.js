import { makeExecutableSchema } from "apollo-server-express";
import {
  systembolagetLatest,
  untappdSearch,
  untappdById,
  untappdUser,
  untappdFriends,
  untappdIsFriend,
  untappdUserBeers,
  decoratedLatest,
  updateUntappdId
} from "./beer/resolvers";
import { omdbById, omdbBySearch } from "./movie/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    untappdSearch,
    untappdById,
    untappdFriends,
    untappdIsFriend,
    untappdUserBeers,
    untappdUser,
    omdbById,
    omdbBySearch,
    systembolagetLatest,
    decoratedLatest
  },
  Mutation: {
    updateUntappdId
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
