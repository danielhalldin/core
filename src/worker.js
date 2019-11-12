import IndexClient from './lib/worker/clients/indexClient';
import SearchClient from './lib/worker/clients/searchClient';
import UntappdClient from './lib/worker/clients/untappdClient';

import indexBeers from './lib/worker/indexBeers';
import decorateBeers from './lib/worker/decorateBeers';

import config from './config';

const indexClient = new IndexClient();
const searchClient = new SearchClient();
const untappdClient = new UntappdClient();

indexClient.healthCheck(60000);

// Indexing
indexBeers(indexClient);
setInterval(() => indexBeers(indexClient), config.indexInterval);

// Decorating
setInterval(() => decorateBeers({ indexClient, searchClient, untappdClient }), config.decoratorInterval);
