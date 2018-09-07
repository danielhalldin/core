// "use strict";

// var got = require("got");
// var _ = require("lodash");

// function Client(clientId, clientSecret) {
//   if (!(this instanceof Client)) {
//     return new Client(clientId, clientSecret);
//   }
//   this.endpoint = "https://api.untappd.com/v4";
//   this.clientSecret = clientSecret;
//   this.clientId = clientId;
// }

// Client.prototype.searchBeer = function(query) {
//   if (!query) {
//     throw new TypeError("Expected a query");
//   }
//   return got(this.endpoint + "/search/beer", {
//     query: this._buildOptions(query),
//     json: true
//   }).then(this._buildResponse);
// };

// Client.prototype.beerInfo = function(bid) {
//   return got(this.endpoint + "/beer/info/" + bid, {
//     query: this._buildOptions(),
//     json: true
//   }).then(this._buildResponse);
// };

// Client.prototype._buildOptions = function(query) {
//   var baseOptions = {
//     client_id: this.clientId,
//     client_secret: this.clientSecret
//   };

//   if (query) {
//     baseOptions.q = query.replace(/\s/g, "+");
//   }

//   return baseOptions;
// };

// Client.prototype._buildResponse = function(res) {
//   return res.body;
// };

// module.exports = Client;
