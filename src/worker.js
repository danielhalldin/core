import xml2js from "xml2js";
import fetch from "node-fetch";
import _ from "lodash";
import IndexClient from "./lib/worker/index_client";
import SearchClient from "./lib/worker/search_client";
import UntappdClient from "./lib/worker/untappd_client";
import config from "./config";

var parser = new xml2js.Parser({ explicitArray: false });
var indexClient = new IndexClient();
//var searchClient = new SearchClient();
// var untappdClient = new UntappdClient(
//   config.untappedClientID,
//   config.untappedClientSecret
// );

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

  await indexClient.deleteIndex("systembolaget");

  await indexClient.createIndex("systembolaget");

  await indexClient.bulkIndex("systembolaget", "artikel", beers);

  console.log("all indexed");
};

indexBeers();

//   searchClient.search(query).then(function(data) {
//     data.hits.hits.map(function(hit) {
//       var SystembolagetProduct = hit._source;
//       var q = "";
//       q = SystembolagetProduct.Namn;
//       q = q + " " + SystembolagetProduct.Producent;
//       //q = q + " " + SystembolagetProduct.Namn2;
//       q = q
//         .split(" ")
//         .filter(function(item, i, allItems) {
//           return i == allItems.indexOf(item);
//         })
//         .join(" ");
//       console.log("q:", q);
//       untappdClient
//         .searchBeer(q)
//         .then(function(serachBeerResponse) {
//           console.log(
//             "serachBeerResponse resp",
//             JSON.stringify(serachBeerResponse)
//           );

//           if (serachBeerResponse.response.beers.items[0]) {
//             var untappdBid =
//               serachBeerResponse.response.beers.items[0].beer.bid;
//             console.log("untappdBid:", untappdBid);
//             untappdClient
//               .beerInfo(untappdBid)
//               .then(function(beerInfoResponse) {
//                 var beer = beerInfoResponse.response.beer;
//                 beer.id = SystembolagetProduct.Artikelid;
//                 beer.checkins = {};
//                 beer.similar = {};
//                 indexClient
//                   .addToIndex("untappd", "beer", beer)
//                   .then(function(msg) {
//                     console.log("SUCCESS decorateData", msg);
//                   })
//                   .catch(function(err) {
//                     console.log("FAIL decorateData", err);
//                   });
//               })
//               .catch(function(err) {
//                 console.log("ERROR untappedClient:beerInfo", err);
//               });
//           } else {
//             // Couldn't find beer in UNTAPPED
//             console.log("untappdBid:", untappdBid);
//             var beer = {
//               lookup_status: false,
//               id: SystembolagetProduct.Artikelid
//             };
//             indexClient.addToIndex("untappd", "beer", beer);
//           }
//         })
//         .catch(function(err) {
//           console.log("ERROR untappedClient:searchBeer", err);
//         });
//     });
//   });
// }

// function scheduledDecorator() {
//   var i = 0;
//   setInterval(function() {
//     decorateData(i);
//     i += 1;
//   }, 10000);
// }

//decorateData(59);
