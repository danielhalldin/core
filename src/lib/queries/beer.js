import _ from "lodash";

const sort = sortFields => {
  return sortFields.map(function(item) {
    var order = _.startsWith(item, "-") ? "desc" : "asc";
    var object = {};
    object[_.trim(item, "+-")] = {
      order: order,
      missing: "_last"
    };
    return object;
  });
};

//    sort: sort(["-Saljstart", "-untappdData.rating_score", "+Namn.keyword"]),

const beers = ({ fromDate, toDate, stockType }) => {
  const q = {
    sort: sort(["-Saljstart", "+Namn.keyword"]),
    query: {
      bool: {
        must: [
          { match: { Varugrupp: { query: "öl", operator: "and" } } },
          { match: { SortimentText: { query: stockType, operator: "and" } } },
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
  return q;
};

const recommendedBeers = ({ fromDate, toDate }) => {
  const q = {
    sort: sort(["-untappdData.rating_score", "-Saljstart", "+Namn.keyword"]),
    query: {
      bool: {
        must: [
          { match: { Varugrupp: { query: "öl", operator: "and" } } },
          {
            range: {
              Saljstart: {
                gte: fromDate,
                lte: toDate
              }
            }
          },
          { exists: { field: "untappdData.rating_score" } }
        ]
      }
    }
  };
  return q;
};

export { beers, recommendedBeers };

// EXISTS
// const beersToDecorate = (fromDate, toDate, stockType) => {
//   const q = Object.assign({}, beers(fromDate, toDate, stockType));
//   q.query.bool.must_not = {
//     exists: { field: "untappdId" }
//   };
//   return q;
// };

// TEST QUERY
// {
//   "sort": [
//     { "Saljstart": { "order": "desc" } },
//     { "untappdData.rating_score": { "order": "desc" } },
//     { "Namn.keyword": { "order": "asc" } }
//   ],
//   "query": {
//     "bool": {
//       "must": [
//         { "match": { "Varugrupp": { "query": "öl", "operator": "and" } } },
//         { "match": { "SortimentText": { "query": "Tillfälligt sortiment", "operator": "and" } } }
//       ]
//     }
//   }
// }

// {
//   "sort": [
//     { "Saljstart": { "order": "desc" } },
//     { "untappdData.rating_score": { "order": "desc" } },
//     { "Namn.keyword": { "order": "asc" } }
//   ],
//   "query": {
//     "bool": {
//       "must": [
//         { "match": { "Varugrupp": { "query": "öl", "operator": "and" } } },
//         { "match": { "SortimentText": { "query": "Tillfälligt sortiment", "operator": "and" } } }
//       ]
//     }
//   },
// "stored_fields" : ["Saljstart", "untappdData.rating_score", "Namn.keyword"]
// }

// CLEANUP QUERY
// {
//   "query": {
//       "range" : {
//           "indexTimestamp" : {
//               "lte" : 1551800910000
//           }
//       }
//   }
// }

// CHECK EMPTY
// {
//   "query": {
//     "bool": {
//        "must_not": [
//          {"exists": { "field": "indexTimestamp" }}
//        ]
//     }
//   }
// }
