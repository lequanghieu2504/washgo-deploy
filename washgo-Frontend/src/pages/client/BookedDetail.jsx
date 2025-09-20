import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookedDetail } from "@/hooks/useBookedDetail";
import { useClientFeedback } from "@/hooks/useClientFeedBack"; // Import the main feedback hook
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  FaChevronLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPhone,
  FaStickyNote,
  FaStar,
  FaPlayCircle,
  FaCalendarCheck,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper to format date and time
const formatDateTime = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} at ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Status configuration updated for all 4 states
const statusConfig = {
  PENDING: {
    text: "Pending",
    color: "text-blue-500 bg-blue-100",
    icon: <FaClock />,
  },
  ACCEPTED: {
    text: "Accepted",
    color: "text-teal-500 bg-teal-100",
    icon: <FaCalendarCheck />,
  },
  DONE: {
    text: "Done",
    color: "text-green-600 bg-green-100",
    icon: <FaCheckCircle />,
  },
  CANCEL: {
    text: "Cancelled",
    color: "text-red-500 bg-red-100",
    icon: <FaTimesCircle />,
  },
};

const BookedDetail = () => {
  const navigate = useNavigate();
  const { id: bookingId } = useParams();

  const {
    data: bookingData,
    isLoading: isBookingLoading,
    isError: isBookingError,
    error: bookingError,
  } = useBookedDetail(bookingId);

  // Use the centralized hook to get feedback for this booking
  const {
    bookingFeedback: feedbackData,
    isBookingFeedbackLoading: isFeedbackLoading,
  } = useClientFeedback({ bookingId });

  if (isBookingLoading) {
    return <LoadingSpinner />;
  }

  if (isBookingError) {
    return (
      <div className="text-center text-red-500 p-8">
        Error loading booking details: {bookingError.message}
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="text-center text-gray-500 p-8">
        No booking details found.
      </div>
    );
  }

  const currentStatus =
    statusConfig[bookingData.status] || statusConfig.PENDING;
  const totalPrice =
    bookingData.listProductDTO?.reduce(
      (sum, p) => sum + (p.pricing?.price || 0),
      0
    ) || 0;

  // Get the first feedback object from the array returned by the API
  const feedback = feedbackData?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white text-gray-800 py-4 px-4 flex items-center shadow-sm sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <FaChevronLeft size={18} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-xl font-semibold">Booking Details</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <span className="font-semibold text-gray-700">Status</span>
          <span
            className={`text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.color}`}
          >
            {currentStatus.icon}
            {currentStatus.text}
          </span>
        </div>

        {/* Carwash Info */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
          <h2 className="font-bold text-lg text-gray-800">
            {bookingData.carwashName}
          </h2>
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-3 text-gray-400" />
            <span>{bookingData.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaCalendarAlt className="mr-3 text-gray-400" />
            <span>{formatDateTime(bookingData.startTime)}</span>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Services</h3>
          <div className="space-y-2 border-t pt-3">
            {bookingData.listProductDTO?.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-700">{product.name}</span>
                <span className="font-medium text-gray-800">
                  {product.pricing?.price.toLocaleString() || 0} VND
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-base font-bold border-t mt-3 pt-3">
            <span className="text-gray-900">Total</span>
            <span className="text-[#cc0000]">
              {totalPrice.toLocaleString()} VND
            </span>
          </div>
        </div>

        {/* Feedback Section */}
        {bookingData.status === "DONE" && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Your Feedback</h3>
            {isFeedbackLoading ? (
              <div className="text-sm text-gray-500">Loading feedback...</div>
            ) : feedback ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < feedback.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="font-bold text-gray-700">
                    ({feedback.rating}/5)
                  </span>
                </div>
                <p className="text-gray-700 italic">
                  "{feedback.comment || "No comment provided."}"
                </p>
                {feedback.media?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {feedback.media.map((media) => (
                      <a
                        key={media.id}
                        href={`${API_URL}${media.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square"
                      >
                        {media.mime.startsWith("video") ? (
                          <>
                            <video
                              src={`${API_URL}${media.url}`}
                              className="w-full h-full object-cover rounded-md bg-black"
                            />
                            <FaPlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl opacity-80" />
                          </>
                        ) : (
                          <img
                            src={`${API_URL}${media.url}`}
                            alt="Feedback media"
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">
                  You have not left feedback for this booking yet.
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/feedback/carwash/${bookingData.carwashId}/booking/${bookingId}`
                    )
                  }
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
                >
                  Leave feedback
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contact & Notes */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center text-gray-600">
            <FaPhone className="mr-3 text-gray-400" />
            <span>{bookingData.phoneNumber}</span>
          </div>
          <div className="flex items-start text-gray-600">
            <FaStickyNote className="mr-3 text-gray-400 mt-1" />
            <span className="italic">
              {bookingData.notes || "No additional notes."}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {bookingData.status === "PENDING" && (
          <div className="pt-4">
            <button className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-lg hover:bg-red-200 transition">
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedDetail;
