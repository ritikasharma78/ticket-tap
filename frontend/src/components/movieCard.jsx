import React from "react";
import timeFormat from "../../libs/timeFormat.js";
import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  return (
    <div
      className="flex flex-col justify-between p-3 bg-[#1b1a1a] rounded-2xl hover:-translate-y-1
    transition duration-300 w-56 h-[360px]"
    >
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
        src={image_base_url + movie.backdrop_path}
        alt=""
        className="w-full h-52 object-bottom-right cursor-pointer object-cover rounded-lg"
      />

      <p className="font-semibold truncate mt-2">{movie.title}</p>
      <p className="text-gray-400 mt-2 text-xs">
        {new Date(movie.release_date).getFullYear()} ●{" "}
        {movie.genres
          .slice(0, 2)
          .map((genre) => genre.name)
          .join(" | ")}{" "}
        ● {timeFormat(movie.runtime)};
      </p>

      <div className="flex items-center justify-between mt-4 pb-3">
        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
          <StarIcon className=" w-4 h-4 text-primary fill-primary" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
