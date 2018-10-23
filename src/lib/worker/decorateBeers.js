import _ from "lodash";
import logger from "../logger";

const tidyQuery = query => {
  query = query
    .toLowerCase()
    .replace("ab", "")
    .replace("aktiebryggeri", "")
    .replace("ale", "")
    .replace("&", "")
    .replace("[ ]+", " ");

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

  for (const stockType of stockTypes) {
    const beersToDecorate = await searchClient.latatestBeersToBeDecorated({
      stockType: stockType,
      size: 50
    });
    beerToDecorate = beersToDecorate.find(beerToDecorate => {
      const untappdData = beerToDecorate._source.untappdData;
      const untappdId = beerToDecorate._source.untappdId;
      return (
        (untappdData === undefined || untappdData === null) &&
        !(untappdId === 0 || untappdId === "0")
      );
    });
    if (beerToDecorate) {
      logger.info(`Stocktype: ${stockType}`);
      break;
    }
  }

  if (!beerToDecorate) {
    return;
  }

  try {
    logger.info(`Running decorateWithUntappd`);
    let { Namn, Namn2, untappdId, Producent } = beerToDecorate._source;
    let untappdData;

    if (untappdId) {
      logger.info(`untappdId: ${untappdId}`);
      untappdData = await untappdClient.fetchBeerById(untappdId);
    } else {
      const queries = [];
      queries.push(tidyQuery(`${Producent} ${Namn} ${Namn2}`));
      queries.push(tidyQuery(`${Namn} ${Namn2}`.replace(Producent, "")));

      for (const [i, q] of queries.entries()) {
        logger.info(`q${i}: ${q}`);
        const untappdSearchResult = await untappdClient.searchBeer(q);
        if (untappdSearchResult.length > 0) {
          untappdData = untappdSearchResult[0];
          untappdId = untappdData.beer.bid;
          break;
        }
      }
    }

    return indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: beerToDecorate._id,
      documentBody: {
        untappdId: untappdId || 0,
        untappdData: untappdData || null
      }
    });
  } catch (e) {
    logger.error("Failed to decorate beer: " + e.message);
  }
};

export default decorateBeers;
