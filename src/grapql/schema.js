import { makeExecutableSchema } from "apollo-server-express";
import Untappd from "./Untappd/resolvers";
import { getMovieById, getMovieBySearch } from "./Omdb/resolvers";
import latestBeers from "./systembolaget/resolvers";
import typeDefs from "./typeDefs";

const resolvers = {
  Query: {
    Untappd,
    getMovieById,
    getMovieBySearch,
    latestBeers
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
