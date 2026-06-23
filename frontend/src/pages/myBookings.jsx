import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/loading";
import BlurCircle from "../components/blurCircle";
import timeFormat from "../../libs/timeFormat";
import { useAppContext } from "../context/AppContext";
import { dateFormat } from "../../libs/dateFormat";
import { useClerk } from "@clerk/react";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openSignIn } = useClerk();
  const { axios, getToken, user, image_base_url } = useAppContext();


  const getMyBookings = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axios, getToken]);

  useEffect(() => {
    if (user) {
      getMyBookings();
    } else {
      setIsLoading(false);
    }
  }, [user, getMyBookings]);

  if (isLoading) return <Loading />;


  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-26 min-h-screen">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-semibold mb-3">
            Please login to view your bookings
          </h1>
          <p className="text-gray-400 mb-5">
            Sign in to access your booking history.
          </p>
          <button
            onClick={openSignIn} // ✅ no need for arrow wrapper
            className="bg-primary px-6 py-3 rounded-full font-medium cursor-pointer"
          >
            Sign In
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-semibold mb-3">No bookings yet</h1>
          <p className="text-gray-400 mb-5">
            Looks like you haven't booked any movies yet.
          </p>
          <Link
            to="/movies"
            className="bg-primary px-6 py-3 rounded-full font-medium"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold mb-4">My Bookings</h1>
          {bookings.map((item) => (
            <div
              key={item._id} // ✅ use unique ID, not index
              className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
            >
              {/* Left side */}
              <div className="flex flex-col md:flex-row">
                <img
                  src={image_base_url + item.show.movie.poster_path}
                  alt={item.show.movie.title}  // ✅ meaningful alt text
                  className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
                />
                <div className="flex flex-col p-4">
                  <p className="text-lg font-semibold">{item.show.movie.title}</p>
                  <p className="text-sm text-gray-400">
                    {timeFormat(item.show.movie.runtime)}
                  </p>
                  <p className="text-sm text-gray-400 mt-auto">
                    {dateFormat(item.show.showDateTime)}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col md:items-end md:text-right justify-between p-4">
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-semibold mb-3">
                    {currency}{item.amount}
                  </p>
                  {!item.isPaid && (
                    <Link
                      to={item.paymentLink}
                      className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                    >
                      Pay Now
                    </Link>
                  )}
                </div>
                <div className="text-sm">
                  <p>
                    <span className="text-gray-400">Total Tickets:</span>{" "}
                    {item.bookedSeats.length}
                  </p>
                  <p>
                    <span className="text-gray-400">Seat Number:</span>{" "}
                    {item.bookedSeats.join(", ")} {/* ✅ space after comma */}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default MyBookings;