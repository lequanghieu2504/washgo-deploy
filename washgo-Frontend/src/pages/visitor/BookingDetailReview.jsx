import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBookedDetail } from "@/hooks/useBookedDetail";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const BookingDetailReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 1. Get only the bookingId from the location state
  const bookingId = location.state?.bookingId;

  console.log("Booking ID from state:", bookingId);

  // 2. Use the hook to fetch booking details
  const { data: bookingData, isLoading, isError } = useBookedDetail(bookingId);

  // Handle case where bookingId is not passed
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Information Not Found
        </h1>
        <p className="text-gray-600 mb-4">
          An error occurred, or you accessed this page directly. Please go back
          and try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full max-w-xs py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 3. Handle loading and error states from the hook
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !bookingData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Failed to Load Booking
        </h1>
        <p className="text-gray-600 mb-4">
          We couldn't retrieve the details for this booking. It may have been
          cancelled or the link is invalid.
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full max-w-xs py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  // 4. Destructure data and calculate derived values
  const {
    notes,
    startTime,
    endTime,
    listProductDTO,
    status: bookingStatus,
  } = bookingData;

  const finalPrice =
    listProductDTO?.reduce((sum, p) => sum + (p.pricing?.price || 0), 0) || 0;
  const currency = listProductDTO?.[0]?.pricing?.currency || "VND";

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      case "ACCEPTED":
        return { text: "Accepted", color: "bg-green-100 text-green-800" };
      case "DONE":
        return { text: "Done", color: "bg-blue-100 text-blue-800" };
      case "CANCEL":
        return { text: "Cancelled", color: "bg-red-100 text-red-800" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  const startDateTime = formatDateTime(startTime);
  const endDateTime = formatDateTime(endTime);
  const statusInfo = getStatusInfo(bookingStatus);

  const handleConfirm = () => {
    // Add your booking confirmation logic here (e.g., API call)
    console.log("Booking confirmed:", bookingData);
    // Navigate to a success page or show a confirmation modal
    alert("Booking successful!");
    navigate("/"); // Navigate to home page after confirmation
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div
          className={`w-16 h-16 ${
            statusInfo.color.split(" ")[0]
          } rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <svg
            className={`w-8 h-8 ${statusInfo.color.split(" ")[1]}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Booking Information
        </h1>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} mt-2`}
        >
          {statusInfo.text}
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Date and Time Section */}
      <div className="py-6 px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Appointment Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{startDateTime.date}</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium text-gray-900">
                {startDateTime.time} - {endDateTime.time}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Services */}
      <div className="py-6 px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selected Services
        </h2>
        <div className="space-y-4">
          {listProductDTO.map((service, index) => (
            <div key={service.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ⏱️ {service.timing}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {service.pricing.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: service.pricing.currency,
                    })}
                  </p>
                </div>
              </div>
              {index < listProductDTO.length - 1 && (
                <div className="border-t border-gray-100 mt-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 mt-6 pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">
              {finalPrice.toLocaleString("en-US", {
                style: "currency",
                currency: currency,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Notes */}
      {notes && (
        <div className="py-6 px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <div
            className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4"
            role="alert"
          >
            <p className="font-bold">Customer Note</p>
            <p>{notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailReview;
