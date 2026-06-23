import React, { useEffect, useState } from "react";
import axios from "axios";

import { PlayCircleIcon } from "lucide-react";

const TrailerSection = () => {
  const [trailers, setTrailers] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/trailers`,
        );

        if (
          response.data &&
          response.data.success &&
          response.data.trailers &&
          response.data.trailers.length > 0
        ) {
          setTrailers(response.data.trailers);
          setCurrentTrailer(response.data.trailers[0]);
        } else {
          console.log("No trailers found in response");
        }
      } catch (error) {
        console.error("TRAILER ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24">
        <p className="text-white">Loading trailers...</p>
      </div>
    );
  }

  if (!currentTrailer) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24">
        <p className="text-red-500">No trailers available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24 overflow-hidden mb-10">
      <p className="text-gray-300 font-medium text-lg mb-6">
        Featured Trailers
      </p>

      <div className="relative">
        <div className="aspect-video max-w-4xl mx-auto overflow-hidden rounded-xl">
          <iframe
            src={`https://www.youtube.com/embed/${currentTrailer.videoKey}`}
            title={currentTrailer.title}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        {trailers.map((trailer) => (
          <div
            key={trailer.id}
            onClick={() => setCurrentTrailer(trailer)}
            className={`relative cursor-pointer hover:scale-105 transition border-2 rounded-lg ${
              currentTrailer.id === trailer.id
                ? "border-primary"
                : "border-transparent"
            }`}
          >
            <img
              src={trailer.image}
              alt={trailer.title}
              className="w-full h-36 object-cover rounded-lg brightness-75"
            />

            <PlayCircleIcon className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2" />

            <p className="text-white text-xs mt-2 truncate">{trailer.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
