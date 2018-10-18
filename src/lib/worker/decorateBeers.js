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

  let beerToDecorate;

  for (const [, el] of stockTypes.entries()) {
    const beersToDecorate = await searchClient.latatestBeersToBeDecorated({
      stockType: el,
      size: 50
    });
    beerToDecorate = beersToDecorate.find(
      beerToDecorate =>
        (beerToDecorate._source.untappdData === undefined ||
          beerToDecorate._source.untappdData === null) &&
        beerToDecorate._source.untappdId !== 0
    );
    if (beerToDecorate) {
      console.log("Stocktype", el);
      break;
    }
  }

  if (!beerToDecorate) {
    return;
  }

  logger.info("Running decorateWithUntappd");

  const name = `${beerToDecorate._source.Namn}${
    beerToDecorate._source.Namn2 ? " " + beerToDecorate._source.Namn2 : ""
  }`;

  try {
    let untappdData;
    let untappdId;
    let documentBody = {
      untappdId: 0
    };

    // Check if the beer has bid
    if (beerToDecorate._source.untappdId) {
      untappdData = await untappdClient.fetchBeerById(
        beerToDecorate._source.untappdId
      );
      untappdId = beerToDecorate._source.untappdId;
    } else {
      const query1 = tidyQuery(`${beerToDecorate._source.Producent} ${name}`);
      logger.info("query1: " + query1);
      const untappdSearchResult = await untappdClient.searchBeer(query1);
      if (untappdSearchResult.length > 0) {
        untappdData = untappdSearchResult[0];
        untappdId = untappdData.beer.bid;
      } else {
        const query2 = tidyQuery(
          name.replace(beerToDecorate._source.Producent, "")
        );
        logger.info("query2: " + query2);
        const untappdSearchResult = await untappdClient.searchBeer(query2);
        if (untappdSearchResult.length > 0) {
          untappdData = untappdSearchResult[0];
          untappdId = untappdData.beer.bid;
        }
      }
    }

    if (untappdData) {
      documentBody = {
        untappdId: untappdId,
        untappdData: untappdData
      };
    }

    return indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: beerToDecorate._id,
      documentBody: documentBody
    });
  } catch (e) {
    logger.error("Failed to decorate beer: " + e.message);
  }
};

export default decorateBeers;
