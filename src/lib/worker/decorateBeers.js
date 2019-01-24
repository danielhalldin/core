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
  const batches = [
    { stockType: "Små partier", size: 50 },
    { stockType: "Lokalt och småskaligt", size: 50 },
    { stockType: "Övrigt sortiment", size: 50 },
    { stockType: "Ordinarie sortiment", size: 50 },
    { stockType: "Små partier", size: 1000 },
    { stockType: "Lokalt och småskaligt", size: 1000 },
    { stockType: "Övrigt sortiment", size: 1000 },
    { stockType: "Ordinarie sortiment", size: 1000 }
  ];

  let beerToDecorate;

  for (const batch of batches) {
    const beersToDecorate = await searchClient.latatestBeersToBeDecorated({
      stockType: batch.stockType,
      size: batch.size
    });

    beerToDecorate = beersToDecorate.find(beerToDecorate => {
      const oneWeek = 1000 * 3600 * 24 * 7;
      const untappdData = beerToDecorate._source.untappdData;
      const untappdId = beerToDecorate._source.untappdId;
      const untappdTimestamp = beerToDecorate._source.untappdTimestamp;

      const hasUntappdData = !(
        untappdData === undefined || untappdData === null
      );
      const shouldBeIgnored = untappdId === 0 || untappdId === "0";
      const souldBeRefreshed =
        !untappdTimestamp || untappdTimestamp < Date.now() - oneWeek; // Older than one week
      return !shouldBeIgnored && (!hasUntappdData || souldBeRefreshed);
    });
    if (beerToDecorate) {
      logger.info(`Stocktype: ${batch.stockType} Size: ${batch.size}`);
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
      logger.info(`untappdId: ${untappdId}, Namn: ${Namn} - ${Namn2}`);
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
        untappdData: untappdData || null,
        untappdTimestamp: Date.now()
      }
    });
  } catch (e) {
    logger.error("Failed to decorate beer: " + e.message);
  }
};

export default decorateBeers;
