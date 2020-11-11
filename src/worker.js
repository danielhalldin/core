import indexClient from './lib/worker/clients/indexClient';
import SearchClient from './lib/worker/clients/searchClient';
import UntappdClient from './lib/worker/clients/untappdClient';
import redisClient from './lib/worker/clients/redisClient';

import synkRepo from './lib/worker/synkRepo';
import decorateRepo from './lib/worker/decorateRepo';

import config from './config';

const searchClient = new SearchClient();
const untappdClient = new UntappdClient();

indexClient.healthCheck(60000);

// Indexing
synkRepo(indexClient, searchClient);
setInterval(() => synkRepo(indexClient, searchClient), config.indexInterval);

// Decorating
setInterval(() => decorateRepo({ indexClient, searchClient, untappdClient, redisClient }), config.decoratorInterval);
