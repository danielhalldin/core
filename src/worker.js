import IndexClient from "./lib/worker/clients/indexClient";
import beerIndexer from "./lib/worker/beerIndexer";
import BeerDecorator from "./lib/worker/beerDecorator";

import config from "./config";

var indexClient = new IndexClient();
var beerDecorator = new BeerDecorator();

indexClient.healthCheck(60000);
beerIndexer(indexClient);

// Indexing

// Decorating
setInterval(beerDecorator.decorateWithUntappd, config.decoratorInterval);
