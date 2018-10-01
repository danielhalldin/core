import xml2js from "xml2js";
import fetch from "node-fetch";
import IndexClient from "./lib/worker/indexClient";
import BeerDecorator from "./lib/worker/beerDecorator";
import logger from "./lib/logger";
import config from "./config";

var parser = new xml2js.Parser({ explicitArray: false });
var indexClient = new IndexClient();
var beerDecorator = new BeerDecorator();

indexClient.healthCheck(60000);

const indexBeers = async () => {
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
  logger.info("Fetching Systembolaget data");
  const res = await fetch(config.systembolaget.url);

  // Parsing
  logger.info("Parsing Systembolaget data");
  const xml = await res.text();
  const json = await new Promise((resolve, reject) =>
    parser.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );
  const beers = json.artiklar.artikel
    .filter(function(article) {
      return article.Varugrupp.toLocaleLowerCase().indexOf("öl") !== -1;
    })
    .map(function(article) {
      article.id = article.Artikelid;
      return article;
    });

  // Indexing
  logger.info("Indexing Systembolaget data");
  await indexClient.bulkIndex("systembolaget", "artikel", beers);

  // Decorating
  setInterval(beerDecorator.decorateWithUntappd, config.decoratorInterval);
};

indexBeers();
