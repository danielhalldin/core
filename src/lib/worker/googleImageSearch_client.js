// 'use strict';

// var got = require('got');
// var _ = require('lodash');

// function Client (id, apiKey) {
//   if (!(this instanceof Client)) {
//     return new Client(id, apiKey);
//   }
//   this.endpoint = 'https://www.googleapis.com';
//   this.apiKey = apiKey;
//   this.id = id;
// }

// Client.prototype.search = function (query, options) {
//   if (!query) {
//     throw new TypeError('Expected a query');
//   }
//   return got(this.endpoint + '/customsearch/v1', {
//     query: this._buildOptions(query, options),
//     json: true
//   }).then(this._buildResponse);
// };

// Client.prototype._buildOptions = function (query, options) {
//   var baseOptions = {
//     q: query.replace(/\s/g, '+'),
//     searchType: 'image',
//     cx: this.id,
//     key: this.apiKey
//   };
//   return _.merge(baseOptions, options);
// };

// Client.prototype._buildResponse = function (res) {
//   console.log("_buildResponse", res.body);

//   return res.body.items.map(function (item) {
//     return {
//       type: item.mime,
//       width: item.image.width,
//       height: item.image.height,
//       size: item.image.byteSize,
//       url: item.link,
//       thumbnail: {
//         url: item.image.thumbnailLink,
//         width: item.image.thumbnailWidth,
//         height: item.image.thumbnailHeight
//       }
//     };
//   });
// };

// module.exports = Client;
