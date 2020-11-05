import fetch from 'node-fetch';
import format from 'date-fns/format';
import logger from '../logger';
import config from '../../config';

const indexBeers = async indexClient => {
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

  // Fetching
  logger.info('Fetching Systembolaget data');
  const res = await fetch(config.systembolaget.url, {
    headers: { 'Ocp-Apim-Subscription-Key': config.systembolaget.subscriptionKey, 'Content-Type': 'application/json' }
  });

  const json = await res.json();

  console.log({ json });
  // Parsing
  logger.info('Parsing Systembolaget data');
  const indexTimestamp = Date.now();
  const beers = json
    .filter(item => item.Category === 'Öl')
    .map(function(item) {
      const salesStartDate = new Date(item.SellStartDate);
      const output = {
        id: item.ProductId,
        nr: item.ProductNumber,
        Artikelid: item.ProductId,
        Varnummer: item.ProductNumberShort,
        Namn: item.ProductNameBold,
        Namn2: item.ProductNameThin,
        Prisinklmoms: item.Price,
        Volymiml: item.Volume,
        Saljstart: format(salesStartDate, 'yyyy-MM-dd'),
        Utgått: item.IsCompletelyOutOfStock,
        Varugrupp: item.Category,
        Typ: item.Type,
        Stil: item.Style,
        Ursprung: item.OriginLevel1,
        Ursprunglandnamn: item.Country,
        Producent: item.ProducerName,
        Leverantor: item.SupplierName,
        Alkoholhalt: item.AlcoholPercentage,
        Sortiment: item.Assortment,
        SortimentText: item.AssortmentText,
        indexTimestamp: indexTimestamp
      };

      return output;
    });

  // Indexing
  logger.info('Indexing Systembolaget data');
  await indexClient.bulkIndex('systembolaget', 'artikel', beers);
  return indexTimestamp;
};

export default indexBeers;
