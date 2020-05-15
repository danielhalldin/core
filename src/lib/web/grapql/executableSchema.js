import { makeExecutableSchema } from 'apollo-server-express';
import {
  decoratedLatest,
  recommended,
  systembolagetLatest,
  systembolagetSearch,
  untappdById,
  untappdFriends,
  untappdIsFriend,
  untappdSearch,
  untappdUser,
  untappdUserBeers,
} from './resolvers';

import { deleteBeer, updateUntappdId } from './mutations';

import typeDefs from './schema';

const resolvers = {
  Query: {
    decoratedLatest,
    recommended,
    systembolagetLatest,
    systembolagetSearch,
    untappdById,
    untappdFriends,
    untappdIsFriend,
    untappdSearch,
    untappdUser,
    untappdUserBeers,
  },
  Mutation: {
    deleteBeer,
    updateUntappdId,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
