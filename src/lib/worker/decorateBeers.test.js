import { shouldBeDecorated, tidyQuery, lookupBeer, refreshBeer, decorateBeers } from './decorateBeers';

const searchBeerMock = jest.fn();
const fetchBeerByIdMock = jest.fn();
const untappdClientMock = {
  fetchBeerById: fetchBeerByIdMock,
  searchBeer: searchBeerMock
};
const latatestBeersToBeDecoratedtMock = jest.fn();
const searchClientMock = {
  latatestBeersToBeDecorated: latatestBeersToBeDecoratedtMock
};
const updateDocumentMock = jest.fn();
const indexClientMock = {
  updateDocument: updateDocumentMock
};

beforeEach(() => {
  latatestBeersToBeDecoratedtMock.mockClear();
  searchBeerMock.mockClear();
  updateDocumentMock.mockClear();
  fetchBeerByIdMock.mockClear();
});

describe('shouldBeDecorated', () => {
  test('Decorates beers that misses untappdData', () => {
    const beerThatShouldBeDecorated = {
      _source: {
        untappdData: undefined,
        untappdTimestamp: Date.now()
      }
    };
    expect(shouldBeDecorated(beerThatShouldBeDecorated)).toBe(true);
  });

  test('Refreshes beers that misses untappdTimestamp', () => {
    const beerThatShouldBeRefreshed = {
      _source: {
        untappdData: undefined
      }
    };
    expect(shouldBeDecorated(beerThatShouldBeRefreshed)).toBe(true);
  });

  test('Ignores beers with untappdId = 0', () => {
    const beerThatShouldBeIgnored = {
      _source: {
        untappdId: 0
      }
    };
    expect(shouldBeDecorated(beerThatShouldBeIgnored)).toBe(false);
  });
});

describe('tidyQuery', () => {
  test('Should filter out specific words', () => {
    const query = 'test ab aktiebryggeri ale &';
    expect(tidyQuery(query)).toEqual('test');
  });

  test('Should deduplicate words', () => {
    const query = 'test test test';
    expect(tidyQuery(query)).toEqual('test');
  });

  test('Should remove multiple spaces', () => {
    const query = 'test   test2   test3';
    expect(tidyQuery(query)).toEqual('test%20test2%20test3');
  });
});

describe('lookupBeer', () => {
  const beerData = { Namn: 'namn', Namn2: 'namn2', Producent: 'Producent' };

  test('Should return valid object if hit', async () => {
    searchBeerMock.mockReturnValueOnce([{ beer: { bid: 1010 } }]);
    const resp = await lookupBeer({ untappdClient: untappdClientMock, beerData });
    expect(searchBeerMock.mock.calls.length).toBe(1);
    expect(searchBeerMock.mock.calls[0][0]).toBe('producent%20namn%20namn2');
    expect(resp).toEqual({ untappdData: { beer: { bid: 1010 } }, untappdId: 1010 });
  });

  test('Should return empty object if no hit', async () => {
    searchBeerMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    const resp = await lookupBeer({ untappdClient: untappdClientMock, beerData });
    expect(resp).toEqual({});
  });

  test('Should retry with second query', async () => {
    searchBeerMock.mockReturnValueOnce([]).mockReturnValueOnce([{ beer: { bid: 1010 } }]);
    const resp = await lookupBeer({ untappdClient: untappdClientMock, beerData });
    expect(searchBeerMock.mock.calls.length).toBe(2);
    expect(searchBeerMock.mock.calls[0][0]).toBe('producent%20namn%20namn2');
    expect(searchBeerMock.mock.calls[1][0]).toBe('namn%20namn2');
    expect(resp).toEqual({ untappdData: { beer: { bid: 1010 } }, untappdId: 1010 });
  });
});

describe('refreshBeer', () => {
  test('Should return valid object', async () => {
    const beerData = { untappdId: 1010 };
    fetchBeerByIdMock.mockReturnValueOnce({
      bid: 1010
    });
    const resp = await refreshBeer({ untappdClient: untappdClientMock, beerData });
    expect(fetchBeerByIdMock.mock.calls.length).toBe(1);
    expect(fetchBeerByIdMock.mock.calls[0][0]).toBe(1010);
    expect(resp).toEqual({ bid: 1010 });
  });
});

describe('decorateBeer', () => {
  test('Indexes a beer correctly', async () => {
    latatestBeersToBeDecoratedtMock.mockReturnValueOnce([
      {
        _source: {
          Namn: 'namn',
          Namn2: 'namn2',
          Producent: 'Producent',
          untappdData: undefined,
          untappdTimestamp: Date.now()
        }
      }
    ]);

    searchBeerMock.mockReturnValueOnce([
      {
        untappdId: 1010,
        untappdData: { dataToBeIndexed: true }
      }
    ]);

    await decorateBeers({
      indexClient: indexClientMock,
      searchClient: searchClientMock,
      untappdClient: untappdClientMock,
      redisClient: undefined
    });
    expect(latatestBeersToBeDecoratedtMock.mock.calls.length).toBe(1);
    expect(latatestBeersToBeDecoratedtMock.mock.calls[0][0]).toEqual({ size: 50, stockType: 'Tillfälligt sortiment' });
    expect(searchBeerMock.mock.calls.length).toBe(1);
    expect(searchBeerMock.mock.calls[0][0]).toEqual('producent%20namn%20namn2');
    expect(updateDocumentMock.mock.calls.length).toBe(1);
    expect(updateDocumentMock.mock.calls[0][0]).toMatchObject({
      documentBody: {
        untappdData: { untappdData: { dataToBeIndexed: true }, untappdId: 1010 },
        untappdId: 0
      },
      id: undefined,
      index: 'systembolaget',
      type: 'artikel'
    });
  });
});
