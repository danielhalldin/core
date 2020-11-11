import fetch from 'node-fetch';
import format from 'date-fns/format';
import logger from '../logger';
import config from '../../config';

const fetchPage = async (page) => {
  logger.info(`Fetching page ${page} Systembolaget beer data`);
  const res = await fetch(
    `https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?size=15&page=${page}&categoryLevel1=%C3%96l&isEcoFriendlyPackage=false&isInDepotStockForFastDelivery=false`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': config.systembolaget.subscriptionKey,
        'Content-Type': 'application/json',
      },
    }
  );

  return await res.json();
};

const translateProducts = (products, indexTimestamp) => {
  return products.map(function (item) {
    const salesStartDate = new Date(item.productLaunchDate);
    return {
      id: item.productId,
      nr: item.productNumber,
      Artikelid: item.productId,
      Varnummer: item.productNumberShort,
      Namn: item.productNameBold,
      Namn2: item.productNameThin,
      Prisinklmoms: item.price,
      Volymiml: item.volume,
      Saljstart: format(salesStartDate, 'yyyy-MM-dd'),
      Utgått: item.isCompletelyOutOfStock,
      Varugrupp: 'Öl',
      Typ: item.categoryLevel2,
      Stil: item.categoryLevel3,
      Ursprung: item.originLevel1,
      Ursprunglandnamn: item.country,
      Producent: item.producerName,
      Leverantor: item.supplierName,
      Alkoholhalt: item.alcoholPercentage,
      Sortiment: item.assortment,
      SortimentText: item.assortmentText,
      indexTimestamp: indexTimestamp,
    };
  });
};

const clenupRepo = (searchClient, indexTimestamp) => {
  const oneDay = 86400000;
  const deleteOlderThanTimestamp = indexTimestamp - oneDay;

  searchClient.cleanupOutdatedBeers({ deleteOlderThanTimestamp }).then((noDeletedBeers) => {
    logger.info(
      `Cleaning up Systembolaget data older than ${format(
        deleteOlderThanTimestamp,
        'yyyy-MM-dd HH:mm:ss'
      )} (${deleteOlderThanTimestamp}), number of beer that was deleted: ${noDeletedBeers}`
    );
  });
};

const syncPages = async (indexClient, indexTimestamp, page = 1) => {
  const data = await fetchPage(page);

  if (data.products === undefined || data.products.length === 0) {
    console.error('Something went wrong while syncing Systembolaget');
    return false;
  }

  const nextPage = data.metadata.nextPage;

  const beers = translateProducts(data.products, indexTimestamp);

  await indexClient.bulkIndex('systembolaget', 'artikel', beers);

  if (nextPage != -1) {
    return syncPages(indexClient, indexTimestamp, nextPage);
  }
  return true;
};

const synkRepo = async (indexClient, searchClient) => {
  logger.info('Start indexing Systembolaget data');
  const indexTimestamp = Date.now();
  const status = await syncPages(indexClient, indexTimestamp, 270);
  if (status) {
    logger.info('Done indexing Systembolaget data');
    clenupRepo(searchClient, indexTimestamp);
  } else {
    logger.error('Something went wrong while syncing Systembolaget');
  }
};

export default synkRepo;
