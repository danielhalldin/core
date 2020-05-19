import _ from 'lodash';

const sort = (sortFields) => {
  return sortFields.map(function (item) {
    var order = _.startsWith(item, '-') ? 'desc' : 'asc';
    var object = {};
    object[_.trim(item, '+-')] = {
      order: order,
      missing: '_last',
    };
    return object;
  });
};

const beers = ({ fromDate, toDate, stockType }) => {
  const q = {
    sort: sort(['-Saljstart', '-untappdData.rating_score', '+Namn.keyword']),
    query: {
      bool: {
        must: [
          { match: { Varugrupp: { query: 'öl', operator: 'and' } } },
          {
            range: {
              Saljstart: {
                gte: fromDate,
                lte: toDate,
              },
            },
          },
        ],
      },
    },
  };

  if (stockType) {
    q.query.bool.must.push({
      match: { SortimentText: { query: stockType, operator: 'and' } },
    });
  }
  return q;
};

const recommendedBeers = ({ fromDate, toDate }) => {
  const q = {
    sort: sort(['-untappdData.rating_score', '-Saljstart', '+Namn.keyword']),
    query: {
      bool: {
        must: [
          { match: { Varugrupp: { query: 'öl', operator: 'and' } } },
          {
            range: {
              Saljstart: {
                gte: fromDate,
                lte: toDate,
              },
            },
          },
          { exists: { field: 'untappdData.rating_score' } },
        ],
      },
    },
  };
  return q;
};

const searchBeers = ({
  searchString,
  searchFields = ['Namn', 'Namn2', 'untappdData.beer.beer_name', 'untappdData.brewery.brewery_name'],
  sortFields = [
    '+Namn.keyword',
    '+untappdData.beer.beer_name.keyword',
    '+Namn2.keyword',
    '+untappdData.brewery.brewery_name.keyword',
  ],
}) => {
  let q = {
    sort: sort(sortFields),
    query: {
      multi_match: {
        query: searchString,
        operator: 'and',
      },
    },
  };
  if (searchFields) {
    q.query.multi_match['fields'] = searchFields;
  }

  return q;
};

export { beers, searchBeers, recommendedBeers };

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
