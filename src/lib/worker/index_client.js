import Elasticsearch from "elasticsearch";
import URI from "urijs";
import config from "../../config";

class IndexClient {
  constructor() {
    const uri = new URI(config.elasticsearchUrl);
    this._client = new Elasticsearch.Client({
      host: uri.toString(),
      apiVersion: "5.0"
    });
  }

  healthCheck = healthCheckInterval => {
    this.ping();
    setInterval(
      function() {
        this.ping();
      }.bind(this),
      healthCheckInterval
    );
  };

  ping = () => {
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

  createIndex = (index, settingsAndMapping) => {
    return this._client.indices.create({
      index: index
      // ,
      // body: settingsAndMapping
    });
  };

  deleteIndex = index => {
    return this._client.indices.delete({
      index: index
    });
  };

  bulkIndex = (index, type, documents) => {
    const body = [];
    documents.slice(0, 5000).forEach(beer => {
      body.push({ index: { _index: index, _type: type } });
      body.push(beer);
    });

    return this._client.bulk({
      body: body
    });
  };

  addToIndex = (index, type, document) => {
    return this._client.index({
      index: index,
      type: type,
      id: document.id,
      body: document
    });
  };

  deleteFromIndex = (index, type, document) => {
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
}

export default IndexClient;
