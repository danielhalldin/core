// import Elasticsearch from "elasticsearch";
// import URI from "urijs";
// import _ from "lodash";
// import moment from "moment";
// import config from "../../config";

// export const SearchClient = () => {
//   const uri = new URI(config.elasticsearchUrl);
//   this._client = new Elasticsearch.Client({
//     host: uri.toString(),
//     apiVersion: "5.0"
//   });
// };

// const search = query => {
//   return this._client.search(query);
// };

// const getLatestBeers = async () => {
//   var twoWeekAgo = new Date();
//   twoWeekAgo.setDate(twoWeekAgo.getDate() - 20);
//   var fromDate = moment(twoWeekAgo);

//   console.log("fromDate", fromDate.format("YYYY-MM-DD"));

//   var sort = ["+Saljstart"].map(function(item) {
//     var order = _.startsWith(item, "-") ? "desc" : "asc";
//     var object = {};
//     object[_.trim(item, "+-")] = {
//       order: order
//     };
//     return object;
//   });

//   var query = {
//     index: ["systembolaget"],
//     size: 500,
//     body: {
//       sort: sort,
//       query: {
//         bool: {
//           filter: {
//             bool: {
//               must: [
//                 { match: { Varugrupp: "öl" } },
//                 {
//                   range: {
//                     Saljstart: {
//                       gte: fromDate
//                     }
//                   }
//                 }
//               ]
//             }
//           }
//         }
//       }
//     }
//   };

//   this._client
//     .search(query)
//     .then(
//       function(data) {
//         var ids = [];
//         var beers = data.hits.hits.map(function(hit) {
//           ids.push(hit._source.id);
//           return hit._source;
//         });
//         this.getUntappedData(ids)
//           .then(function(untappd) {
//             if (untappd.hits.hits.length > 0) {
//               beers = beers.map(function(beer) {
//                 var ub = _.find(untappd.hits.hits, function(o) {
//                   return o._source.id === beer.id;
//                 });
//                 if (ub) {
//                   beer.untapped = ub._source;
//                 }
//                 return beer;
//               });
//             }
//             deferred.resolve(beers);
//           })
//           .catch(function(err) {
//             deferred.reject(err);
//           });
//       }.bind(this)
//     )
//     .catch(function(err) {
//       console.log(err);
//     });

//   return deferred.promise;
// };

// const getUntappedData = ids => {
//   var query = {
//     index: ["untappd"],
//     size: 200,
//     body: {
//       query: {
//         ids: {
//           values: ids
//         }
//       }
//     }
//   };

//   return this._client.search(query);
// };
