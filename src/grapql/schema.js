import { makeExecutableSchema } from "apollo-server-express";
import {
  systembolagetLatest,
  untappdSearch,
  untappdById,
  decoratedLatest
} from "./beer/resolvers";
import { omdbById, omdbBySearch } from "./movie/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    untappdSearch,
    untappdById,
    omdbById,
    omdbBySearch,
    systembolagetLatest,
    decoratedLatest
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
