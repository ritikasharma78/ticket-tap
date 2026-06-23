import axios from "axios";

export const getTrailers = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/popular",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    const movies = data.results.slice(0, 8);

    const trailers = [];

    for (const movie of movies) {
      try {
        const { data: videoData } = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }
        );

        const trailer = videoData.results.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer"
        );

        if (trailer) {
          trailers.push({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
            videoKey: trailer.key,
          });
        }
      } catch (err) {
        console.log(`No trailer found for ${movie.title}`);
      }
    }

    res.json({
      success: true,
      trailers,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};