import _ from "lodash";

var sort = ["-Saljstart"].map(function(item) {
  var order = _.startsWith(item, "-") ? "desc" : "asc";
  var object = {};
  object[_.trim(item, "+-")] = {
    order: order
  };
  return object;
});

console.log("sort", sort);

const query = (fromDate, toDate, stockType) => {
  return {
    sort: sort,
    query: {
      bool: {
        filter: {
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
      }
    }
  };
};

export default query;
