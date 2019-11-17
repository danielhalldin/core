import { shouldBeDecorated, tidyQuery } from './decorateBeers';

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
