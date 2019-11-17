import { shouldBeDecorated } from './decorateBeers';

const beerThatShouldBeDecorated = {
  _source: {
    untappdData: undefined,
    untappdTimestamp: Date.now()
  }
};

const beerThatShouldBeRefreshed = {
  _source: {
    untappdData: undefined
  }
};

const beerThatShouldBeIgnored = {
  _source: {
    untappdId: 0
  }
};

describe('ShouldBeDecorated', () => {
  test('Decorates beers that misses untappdData', () => {
    expect(shouldBeDecorated(beerThatShouldBeDecorated)).toBe(true);
  });

  test('Refreshes beers that misses untappdTimestamp', () => {
    expect(shouldBeDecorated(beerThatShouldBeRefreshed)).toBe(true);
  });

  test('Ignores beers with untappdId = 0', () => {
    expect(shouldBeDecorated(beerThatShouldBeIgnored)).toBe(false);
  });
});
