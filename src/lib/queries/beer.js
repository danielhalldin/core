import _ from 'lodash';

const sort = sortFields => {
  return sortFields.map(function(item) {
    var order = _.startsWith(item, '-') ? 'desc' : 'asc';
    var object = {};
    object[_.trim(item, '+-')] = {
      order: order,
      missing: '_last'
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
                lte: toDate
              }
            }
          }
        ]
      }
    }
  };

  if (stockType) {
    q.query.bool.must.push({
      match: { SortimentText: { query: stockType, operator: 'and' } }
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
                lte: toDate
              }
            }
          },
          { exists: { field: 'untappdData.rating_score' } }
        ]
      }
    }
  };
  return q;
};

const searchBeers = ({ searchString, searchType = 'beer', sortType = 'rating' }) => {
  let sortFields;
  switch (sortType) {
    case 'date':
      sortFields = [
        '-Saljstart',
        '-untappdData.rating_score',
        '+untappdData.beer.beer_name.keyword',
        '+untappdData.brewery.brewery_name.keyword'
      ];
      break;
    case 'rating':
      sortFields = [
        '-untappdData.rating_score',
        '+untappdData.beer.beer_name.keyword',
        '+untappdData.brewery.brewery_name.keyword'
      ];
      break;
    case 'name':
      sortFields = [
        '+untappdData.beer.beer_name.keyword',
        '+untappdData.brewery.brewery_name.keyword',
        '-untappdData.rating_score'
      ];
      if (searchType === 'brewery') {
        sortFields = [
          '+untappdData.brewery.brewery_name.keyword',
          '+untappdData.beer.beer_name.keyword',
          '-untappdData.rating_score'
        ];
      }
      break;
    default:
      sortFields = ['-untappdData.rating_score'];
      break;
  }
  let q = {
    sort: sort(sortFields),
    query: {
      multi_match: {
        query: searchString,
        operator: 'and'
      }
    }
  };
  switch (searchType) {
    case 'beer':
      q.query.multi_match['fields'] = ['untappdData.beer.beer_name'];
      break;
    case 'brewery':
      q.query.multi_match['fields'] = ['untappdData.brewery.brewery_name'];
      break;
  }

  return q;
};

// run '/systembolaget/_delete_by_query'
const cleanupBeers = ({ deleteOlderThanTimestamp }) => {
  const q = {
    query: {
      range: {
        indexTimestamp: {
          lt: deleteOlderThanTimestamp
        }
      }
    }
  };
  return q;
};

const stock = () => {
  const q = {
    aggs: {
      stock: {
        terms: { field: 'SortimentText.keyword' },
        aggs: {
          maxSalesStartDate: { max: { field: 'Saljstart' } }
        }
      }
    }
  };
  return q;
};

export { beers, searchBeers, recommendedBeers, cleanupBeers, stock };

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
