import _ from "lodash";

var sort = ["-Saljstart", "+Namn.keyword"].map(function(item) {
  var order = _.startsWith(item, "-") ? "desc" : "asc";
  var object = {};
  object[_.trim(item, "+-")] = {
    order: order
  };
  return object;
});

const beers = ({ fromDate, toDate, stockType }) => {
  let salesStart = {};
  if (fromDate) {
    salesStart.gte = fromDate;
  }
  if (toDate) {
    salesStart.lte = toDate;
  }

  const q = {
    sort: sort,
    query: {
      bool: {
        must: [
          { match: { Varugrupp: { query: "öl", operator: "and" } } },
          { match: { SortimentText: { query: stockType, operator: "and" } } },
          {
            range: {
              Saljstart: salesStart
            }
          }
        ]
      }
    }
  };
  return q;
};

// const beersToDecorate = (fromDate, toDate, stockType) => {
//   const q = Object.assign({}, beers(fromDate, toDate, stockType));
//   q.query.bool.must_not = {
//     exists: { field: "untappdId" }
//   };
//   return q;
// };

export { beers };
