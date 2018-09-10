const getMovie = async (obj, { id }, { dataSources }) => {
  const data = await dataSources.OmdbAPI.getMovie(id);
  const metacritic = data.Ratings.find(rating => rating.Source === "Metacritic")
    .Value;
  const rottenTomatoes = data.Ratings.find(
    rating => rating.Source === "Rotten Tomatoes"
  ).Value;
  const imdb = data.Ratings.find(
    rating => rating.Source === "Internet Movie Database"
  ).Value;

  return {
    title: data.Title,
    metacritic,
    rottenTomatoes,
    imdb
  };
};

export default getMovie;
