import { makeExecutableSchema } from "apollo-server-express";
import Untappd from "./beer/resolvers";
import { getMovieById, getMovieBySearch } from "./movie/resolvers";
import getLatestBeers from "./systembolaget/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    Untappd,
    getMovieById,
    getMovieBySearch,
    getLatestBeers
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
