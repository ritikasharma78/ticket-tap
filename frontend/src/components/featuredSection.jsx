import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./blurCircle";

import MovieCard from "./movieCard";
import { useAppContext } from "../context/AppContext";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { shows} = useAppContext();
  return (
    <div className="relative mx-auto max-w-7xl px-6 md:px-16 lg:px-24 xl:px-30 overflow-hidden">
      {/* title */}
      <BlurCircle top="0" right="7%" />
      <div className="relative flex items-center justify-between pt-10 pb-10">
        <p className="text-gray-300  font-medium text-lg">Now Showing</p>
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          {" "}
          View All
          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* movie card/list */}
      <div className="flex flex-wrap max-sm:justify-center gap-8  ">
        {shows.slice(0, 4).map((show) => (
          <div key={show._id} className="mb-0">
            <MovieCard movie={show} />
          </div>
        ))}
      </div>

      {/* button */}

      <div className="flex justify-center mt-10">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md mb-4 font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
