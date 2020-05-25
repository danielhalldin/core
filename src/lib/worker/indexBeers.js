import fetch from 'node-fetch';
import xml2js from 'xml2js';
import logger from '../logger';
import config from '../../config';

var parser = new xml2js.Parser({ explicitArray: false });

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

  // Fetching
  logger.info('Fetching Systembolaget data');
  const res = await fetch(config.systembolaget.url);

  // Parsing
  logger.info('Parsing Systembolaget data');
  const xml = await res.text();
  const json = await new Promise((resolve, reject) =>
    parser.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );
  const indexTimestamp = Date.now();
  const beers = json.artiklar.artikel
    .filter(function (article) {
      return article.Varugrupp && article.Varugrupp.toLocaleLowerCase().indexOf('öl') !== -1;
    })
    .map(function (article) {
      article.id = article.Artikelid;
      article.indexTimestamp = indexTimestamp;
      return article;
    });

  // Indexing
  logger.info('Indexing Systembolaget data');
  await indexClient.bulkIndex('systembolaget', 'artikel', beers);
  return indexTimestamp;
};

export default indexBeers;
