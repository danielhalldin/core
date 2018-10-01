import _ from "lodash";

var sort = ["-Saljstart", "+Namn.keyword"].map(function(item) {
  var order = _.startsWith(item, "-") ? "desc" : "asc";
  var object = {};
  object[_.trim(item, "+-")] = {
    order: order
  };
  return object;
});

const beers = (fromDate, toDate, stockType) => {
  return {
    sort: sort,
    query: {
      bool: {
        must: [
          { match: { Varugrupp: "öl" } },
          { match: { SortimentText: stockType } },
          {
            range: {
              Saljstart: {
                gte: fromDate,
                lte: toDate
              }
            }
          }
        ]
      }
    }
  };
};

const beersToDecorate = (fromDate, toDate, stockType) => {
  const q = Object.assign({}, beers(fromDate, toDate, stockType));
  q.query.bool.must_not = {
    exists: { field: "untappdId" }
  };
  return q;
};

export { beers, beersToDecorate };
