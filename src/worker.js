import indexClient from './lib/worker/clients/indexClient';
import SearchClient from './lib/worker/clients/searchClient';
import UntappdClient from './lib/worker/clients/untappdClient';
import redisClient from './lib/worker/clients/redisClient';

import indexBeers from './lib/worker/indexBeers';
import decorateBeers from './lib/worker/decorateBeers';

import config from './config';

const searchClient = new SearchClient();
const untappdClient = new UntappdClient();

indexClient.healthCheck(60000);

// Indexing
indexBeers(indexClient);
setInterval(() => indexBeers(indexClient), config.indexInterval);

// Decorating
setInterval(() => decorateBeers({ indexClient, searchClient, untappdClient, redisClient }), config.decoratorInterval);
