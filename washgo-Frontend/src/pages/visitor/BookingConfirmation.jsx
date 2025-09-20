import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingConfirmation = () => {
  const location = useLocation();
  const bookingData = location.state;
  const navigate = useNavigate();

  console.log("Booking Data from Location State:", bookingData);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewBookingDetails = () => {
    navigate("/booking-details", {
      state: bookingData || {},
    });
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-8">
      {/* Success Icon */}
      <div className="mb-12">
        <div className="w-32 h-32 mx-auto rounded-full border-4 border-red-600 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-16 text-center">
        Your Booking Placed
      </h1>

      {/* Buttons Container */}
      <div className="w-full max-w-sm space-y-4">
        {/* View Booking Details Button */}
        <button
          onClick={handleViewBookingDetails}
          className="w-full py-4 px-6 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          View Booking Details
        </button>

        {/* Go to Home Button */}
        <button
          onClick={handleGoHome}
          className="w-full py-4 px-6 bg-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
