import moment from 'moment';
import indexClient from './lib/worker/clients/indexClient';
import SearchClient from './lib/worker/clients/searchClient';
import UntappdClient from './lib/worker/clients/untappdClient';
import redisClient from './lib/worker/clients/redisClient';

import indexBeers from './lib/worker/indexBeers';
import decorateBeers from './lib/worker/decorateBeers';

import config from './config';
import logger from './lib/logger';

const searchClient = new SearchClient();
const untappdClient = new UntappdClient();

indexClient.healthCheck(60000);

// Indexing
indexBeers(indexClient).then(indexTimestamp => {
  const twoDays = 172800000;
  const deleteOlderThanTimestamp = indexTimestamp - twoDays;
  searchClient.cleanupOutdatedBeers({ deleteOlderThanTimestamp }).then(noDeletedBeers => {
    logger.info(
      `Cleaning up Systembolaget data older than ${moment(deleteOlderThanTimestamp).format(
        'YYYY-MM-DD HH:mm:ss'
      )} (${deleteOlderThanTimestamp}), number of beer that was deleted: ${noDeletedBeers}`
    );
  });
});

setInterval(() => indexBeers(indexClient), config.indexInterval);

// Decorating
decorateBeers({ indexClient, searchClient, untappdClient, redisClient });
setInterval(() => decorateBeers({ indexClient, searchClient, untappdClient, redisClient }), config.decoratorInterval);
