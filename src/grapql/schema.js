import { makeExecutableSchema } from "apollo-server-express";
import Untappd from "./beer/resolvers";
import Omdb from "./movies/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    Untappd,
    Omdb
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
