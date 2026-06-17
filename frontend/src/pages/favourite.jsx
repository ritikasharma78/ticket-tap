import React from "react";
import { dummyShowsData } from "../../assets/assets";
import MovieCard from "../components/movieCard";
import BlurCircle from "../components/blurCircle";

const Favourite = () => {
  return dummyShowsData.length > 0 ? (
    <div className="relative max-w-7xl my-20 mb-20  px-20 md:px-16  lg:px-40 xl:px-40  overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="text-lg font-medium my-4">Your Favourites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-8  ">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No movies available</h1>
    </div>
  );
};

export default Favourite;
