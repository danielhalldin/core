"use strict";

var Elasticsearch = require("elasticsearch"),
  URI = require("urijs");

var config = require("../../config");

var IndexClient = function() {
  var uri = new URI(config.elasticsearchUrl);
  this._client = new Elasticsearch.Client({
    host: uri.toString(),
    apiVersion: "5.0"
  });
};

IndexClient.prototype.healthCheck = function(healthCheckInterval) {
  this.ping();
  setInterval(
    function() {
      this.ping();
    }.bind(this),
    healthCheckInterval
  );
};

IndexClient.prototype.ping = function() {
  this._client.ping(
    {
      requestTimeout: 60000
    },
    function(error) {
      if (error) {
        console.log("Elasticsearch ping: DOWN");
      } else {
        console.log("Elasticsearch ping: OK");
      }
    }
  );
};

IndexClient.prototype.bulkIndex = function(index, type, documents) {
  const body = [];
  documents.slice(0, 5000).forEach(beer => {
    body.push({ index: { _index: index, _type: type } });
    body.push(beer);
  });

  return this._client.bulk({
    body: body
  });
};

IndexClient.prototype.deleteIndex = function(index) {
  return this._client.indices.delete({
    index: index
  });
};

IndexClient.prototype.createIndex = function(index, settingsAndMapping) {
  return this._client.indices.create({
    index: index
    // ,
    // body: settingsAndMapping
  });
};

IndexClient.prototype.addToIndex = function(index, type, document) {
  return this._client.index({
    index: index,
    type: type,
    id: document.id,
    body: document
  });
};

IndexClient.prototype.deleteFromIndex = function(index, type, document) {
  this._client.delete(
    {
      index: index,
      type: type,
      id: document.id
    },
    function(error, response) {
      if (error) {
        console.error("Failed to delete document from index: " + error);
      } else {
        console.info(
          "Deleted document from indexed." +
            " Index: " +
            response._index +
            " Type: " +
            response._type +
            " Id: " +
            response._id +
            " Title: " +
            document.title
        );
      }
    }
  );
};

module.exports = IndexClient;
