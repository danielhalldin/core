import xml2js from "xml2js";
import fetch from "node-fetch";
import IndexClient from "./lib/worker/index_client";
import config from "./config";

var parser = new xml2js.Parser({ explicitArray: false });
var indexClient = new IndexClient();

indexClient.healthCheck(60000);

const indexBeers = async () => {
  // fetching
  const res = await fetch(config.systembolagetUrl);

  // parsing
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

  // index
  await indexClient.deleteIndex("systembolaget");
  await indexClient.createIndex("systembolaget");
  await indexClient.bulkIndex("systembolaget", "artikel", beers);

  console.log("All indexed");
};

indexBeers();
