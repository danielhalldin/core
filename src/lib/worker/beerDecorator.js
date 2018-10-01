import _ from "lodash";
import SearchClient from "./searchClient";
import IndexClient from "./indexClient";
import UntappdClient from "./untappdClient";
import logger from "../logger";

class beerDecorator {
  constructor() {
    this.searchClient = new SearchClient();
    this.indexClient = new IndexClient();
    this.untappdClient = new UntappdClient();
  }

  tidyQuery = query => {
    query = query
      .toLowerCase()
      .replace("ab", "")
      .replace("aktiebryggeri", "")
      .replace("ipa", "")
      .replace("ale", "")
      .replace("&", "");

    return _.uniq(query.split(" ")).join(" ");
  };

  decorateWithUntappd = async () => {
    const beersToDecorate = await this.searchClient.latatestBeersToBeDecorated({
      size: 1
    });

    if (beersToDecorate.length === 0) {
      return;
    }

    logger.info("Running decorateWithUntappd");

    beersToDecorate.map(async beer => {
      const name = `${beer._source.Namn}${
        beer._source.Namn2 ? " " + beer._source.Namn2 : ""
      }`;

      try {
        const query1 = this.tidyQuery(`${beer._source.Producent} ${name}`);
        logger.info("query1: " + query1);
        const untappdSearchResult = await this.untappdClient.searchBeer(query1);

        let untappdData;
        if (untappdSearchResult.length > 0) {
          untappdData = untappdSearchResult[0];
        } else {
          const query2 = this.tidyQuery(
            name.replace(beer._source.Producent, "")
          );
          logger.info("query2: " + query2);
          const untappdSearchResult = await this.untappdClient.searchBeer(
            query2
          );
          if (untappdSearchResult.length > 0) {
            untappdData = untappdSearchResult[0];
          }
        }

        let documentBody = {
          untappdId: 0
        };
        if (untappdData) {
          documentBody = {
            untappdId: untappdData.beer.bid,
            untappdData: untappdData
          };
        }

        return this.indexClient.updateDocument({
          index: "systembolaget",
          type: "artikel",
          id: beer._id,
          documentBody: documentBody
        });
      } catch (e) {
        logger.error("Failed to decorate beer: " + e.message);
      }
    });
  };
}

export default beerDecorator;
