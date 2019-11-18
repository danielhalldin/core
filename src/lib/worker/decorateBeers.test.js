import { shouldBeDecorated, tidyQuery, lookupBeer } from './decorateBeers';

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
  const myMock = jest.fn();
  const beerData = { Namn: 'namn', Namn2: 'namn2', Producent: 'Producent' };

  beforeEach(() => {
    myMock.mockClear();
  });

  test('Should return valid object if hit', async () => {
    myMock.mockReturnValueOnce([{ beer: { bid: 1010 } }]);
    const untappdClient = { searchBeer: myMock };
    const resp = await lookupBeer({ untappdClient, beerData });
    expect(myMock.mock.calls.length).toBe(1);
    expect(myMock.mock.calls[0][0]).toBe('producent%20namn%20namn2');
    expect(resp).toEqual({ untappdData: { beer: { bid: 1010 } }, untappdId: 1010 });
  });

  test('Should return empty object if no hit', async () => {
    myMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    const untappdClient = { searchBeer: myMock };
    const resp = await lookupBeer({ untappdClient, beerData });
    expect(resp).toEqual({});
  });

  test('Should retry with second query', async () => {
    myMock.mockReturnValueOnce([]).mockReturnValueOnce([{ beer: { bid: 1010 } }]);
    const untappdClient = { searchBeer: myMock };
    const resp = await lookupBeer({ untappdClient, beerData });
    expect(myMock.mock.calls.length).toBe(2);
    expect(myMock.mock.calls[0][0]).toBe('producent%20namn%20namn2');
    expect(myMock.mock.calls[1][0]).toBe('namn%20namn2');
    expect(resp).toEqual({ untappdData: { beer: { bid: 1010 } }, untappdId: 1010 });
  });
});
