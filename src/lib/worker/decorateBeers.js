import _ from 'lodash';
import logger from '../logger';
import { send } from '../../lib/push';

const batches = [
  { stockType: 'Tillfälligt sortiment', size: 50 },
  { stockType: 'Lokalt & småskaligt', size: 50 },
  { stockType: 'Säsong', size: 50 },
  { stockType: 'Fast sortiment', size: 50 },
  { stockType: 'Ordervaror', size: 50 },
  { stockType: 'Tillfälligt sortiment', size: 150 },
  { stockType: 'Lokalt & småskaligt', size: 150 },
  { stockType: 'Säsong', size: 150 },
  { stockType: 'Fast sortiment', size: 150 },
  { stockType: 'Ordervaror', size: 150 },
  { stockType: 'Tillfälligt sortiment', size: 1000 },
  { stockType: 'Lokalt & småskaligt', size: 1000 },
  { stockType: 'Säsong', size: 1000 },
  { stockType: 'Fast sortiment', size: 1000 },
  { stockType: 'Ordervaror', size: 1000 }
];

export const tidyQuery = query => {
  const regex = /ab|aktiebryggeri|ale|&/gm;
  query = query
    .toLowerCase()
    .replace(regex, '')
    .replace(/\s\s+/gm, ' ');
  return encodeURIComponent(
    _.uniq(query.split(' '))
      .join(' ')
      .trim()
  );
};

export const shouldBeDecorated = b => {
  const refreshInterval = 1000 * 3600 * 24 * 2; //two days
  const untappdData = _.get(b, '_source.untappdData');
  const untappdId = _.get(b, '_source.untappdId');
  const untappdTimestamp = _.get(b, '_source.untappdTimestamp');

  const hasUntappdData = !(untappdData === undefined || untappdData === null);
  const shouldBeIgnored = untappdId === 0 || untappdId === '0';
  const souldBeRefreshed = !untappdTimestamp || untappdTimestamp < Date.now() - refreshInterval;

  return !shouldBeIgnored && (!hasUntappdData || souldBeRefreshed);
};

export const refreshBeer = async ({ untappdClient, beerData: { untappdId } }) => {
  return await untappdClient.fetchBeerById(untappdId);
};

export const lookupBeer = async ({ untappdClient, beerData: { Namn, Namn2, Producent } }) => {
  const queries = [tidyQuery(`${Producent} ${Namn} ${Namn2}`), tidyQuery(`${Namn} ${Namn2}`.replace(Producent, ''))];

  for (const [i, q] of queries.entries()) {
    logger.info(`q${i}: ${q}`);
    const untappdSearchResult = await untappdClient.searchBeer(q);
    if (untappdSearchResult.length > 0) {
      return {
        untappdData: _.get(untappdSearchResult, '[0]'),
        untappdId: _.get(untappdSearchResult, '[0].beer.bid')
      };
    }
  }

  return {};
};

export const decorateBeers = async ({ indexClient, searchClient, untappdClient }) => {
  let beerToDecorate;

  for (const batch of batches) {
    const beersToDecorate = await searchClient.latatestBeersToBeDecorated(batch);
    beerToDecorate = beersToDecorate.find(shouldBeDecorated);
    if (beerToDecorate) {
      logger.info(`Stocktype: ${batch.stockType} Size: ${batch.size}`);
      break;
    }
  }

  if (!beerToDecorate) {
    return;
  }

  try {
    logger.info(`Running decorateWithUntappd`);
    let untappdData;
    const { Namn, Namn2 } = beerToDecorate._source;
    let untappdId = _.get(beerToDecorate, '_source.untappdId');

    if (untappdId) {
      logger.info(`untappdId: ${untappdId}, Namn: ${Namn} - ${Namn2}`);
      untappdData = await refreshBeer({ untappdClient, beerData: beerToDecorate._source });
    } else {
      const result = await lookupBeer({ untappdClient, beerData: beerToDecorate._source });
      untappdId = result.untappdId;
      untappdData = result.untappdData;
      if (untappdData) {
        send({ systembolagetData: beerToDecorate, untappdData });
      }
    }

    return indexClient.updateDocument({
      index: 'systembolaget',
      type: 'artikel',
      id: beerToDecorate._id,
      documentBody: {
        untappdId: untappdId || 0,
        untappdData: untappdData || null,
        untappdTimestamp: Date.now()
      }
    });
  } catch (e) {
    logger.error('Failed to decorate beer: ' + e.message);
  }
};

export default decorateBeers;
