const transformMovieData = data => {
  const metacritic =
    data.Ratings &&
    data.Ratings.find(
      rating => rating.Source && rating.Source === "Metacritic"
    );
  const rottenTomatoes =
    data.Ratings &&
    data.Ratings.find(
      rating => rating.Source && rating.Source === "Rotten Tomatoes"
    );
  const imdb =
    data.Ratings &&
    data.Ratings.find(
      rating => rating.Source && rating.Source === "Internet Movie Database"
    );

  return {
    title: data.Title,
    metacritic: metacritic && metacritic.Value,
    rottenTomatoes: rottenTomatoes && rottenTomatoes.Value,
    imdb: imdb && imdb.Value
  };
};

const omdbById = async (obj, { imdbId }, { dataSources }) => {
  const data = await dataSources.OmdbAPI.getMovieById(imdbId);
  return transformMovieData(data);
};

const omdbBySearch = async (obj, { searchString }, { dataSources }) => {
  const data = await dataSources.OmdbAPI.getMovieBySearch(searchString);

  const test = await data.Search.map(async item => {
    const data = await dataSources.OmdbAPI.getMovieById(item.imdbID);
    return transformMovieData(data);
  });

  return test;
};

export { omdbById, omdbBySearch };
