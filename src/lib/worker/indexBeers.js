import fetch from 'node-fetch';
import format from 'date-fns/format';
import logger from '../logger';
import config from '../../config';

const indexBeers = async (indexClient) => {
  // // REMOVE AND CREATE INDEX
  // try {
  //   await indexClient.deleteIndex("systembolaget");
  //   logger.info("Removed index 'systembolget'");
  // } catch (e) {
  //   logger.info("Faild to remove index 'systembolget'");
  // }
  // try {
  //   await indexClient.createIndex("systembolaget");
  //   logger.info("Created index 'systembolget'");
  // } catch (e) {
  //   logger.info("Faild to create index 'systembolget'");
  // }

  const indexTimestamp = Date.now();

  logger.info('Start indexing Systembolaget data');
  const indexPage = async (page = 1) => {
    // Fetching
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

    const json = await res.json();

    if (json.products === undefined || json.products.length === 0) {
      console.error('Something went wrong while syncing Systembolaget');
      return false;
    }
    const nextPage = json.metadata.nextPage;

    const beers = json.products.map(function (item) {
      const salesStartDate = new Date(item.productLaunchDate);
      const output = {
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

      return output;
    });

    await indexClient.bulkIndex('systembolaget', 'artikel', beers);

    if (nextPage != -1) {
      return indexPage(nextPage);
    }
    return true;
  };

  const status = await indexPage(270);
  if (status) {
    logger.info('Done indexing Systembolaget data');
    // TODO Cleanup
  } else {
    logger.error('Something went wrong while syncing Systembolaget');
  }
};

export default indexBeers;
