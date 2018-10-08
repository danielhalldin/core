import _ from "lodash";
import logger from "../logger";

const tidyQuery = query => {
  query = query
    .toLowerCase()
    .replace("ab", "")
    .replace("aktiebryggeri", "")
    .replace("ale", "")
    .replace("&", "");

  return _.uniq(query.split(" ")).join(" ");
};

const decorateBeers = async ({ indexClient, searchClient, untappdClient }) => {
  const stockTypes = [
    "Små partier",
    "Lokalt och småskaligt",
    "Övrigt sortiment",
    "Ordinarie sortiment"
  ];

  let beersToDecorate;

  for (const [, el] of stockTypes.entries()) {
    beersToDecorate = await searchClient.latatestBeersToBeDecorated({
      size: 1,
      stockType: el
    });
    if (beersToDecorate.length !== 0) {
      break;
    }
  }

  if (beersToDecorate.length === 0) {
    return;
  }

  logger.info("Running decorateWithUntappd");

  beersToDecorate.map(async beer => {
    const name = `${beer._source.Namn}${
      beer._source.Namn2 ? " " + beer._source.Namn2 : ""
    }`;

    try {
      const query1 = tidyQuery(`${beer._source.Producent} ${name}`);
      logger.info("query1: " + query1);
      const untappdSearchResult = await untappdClient.searchBeer(query1);

      let untappdData;
      if (untappdSearchResult.length > 0) {
        untappdData = untappdSearchResult[0];
      } else {
        const query2 = tidyQuery(name.replace(beer._source.Producent, ""));
        logger.info("query2: " + query2);
        const untappdSearchResult = await untappdClient.searchBeer(query2);
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

      return indexClient.updateDocument({
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

export default decorateBeers;
