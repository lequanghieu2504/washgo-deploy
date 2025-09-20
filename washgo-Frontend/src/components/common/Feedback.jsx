import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClientFeedback } from "@/hooks/useClientFeedBack";
import { useTokenRefresh } from "@/hooks/useTokenRefresh.jsx";
import { useBookedDetail } from "@/hooks/useBookedDetail";
import {
  FaStar,
  FaCamera,
  FaTimes,
  FaPlayCircle,
  FaChevronLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Helper to upload a single media file to a feedback entry
const uploadMediaForFeedback = async (feedbackId, file, token) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }
  return response.json();
};

const suggestions = [
  "Good service",
  "Friendly staff",
  "Clean facility",
  "Quick and efficient",
  "Great value",
  "Could be better",
];

export default function Feedback() {
  const navigate = useNavigate();
  const { accessToken } = useTokenRefresh();
  const { carwashId, bookingId } = useParams();

  // --- Fetch booking details using the ID from the URL ---
  const {
    data: bookingDetails,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useBookedDetail(bookingId);

  // Use the custom hook for feedback creation
  const { createFeedback, isCreatingFeedback, createError } =
    useClientFeedback();

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Effect to clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - mediaFiles.length); // Limit to 5 total files
    if (files.length === 0) return;

    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSuggestion = (suggestion) => {
    setComment((prev) => (prev ? `${prev}. ${suggestion}` : suggestion));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    const feedbackData = {
      bookingId,
      rating,
      comment,
      carwashID: carwashId,
    };

    createFeedback(feedbackData, {
      onSuccess: async (createdFeedback) => {
        const feedbackId = createdFeedback.id;

        // If there are media files, upload them now
        if (mediaFiles.length > 0 && feedbackId) {
          toast.info("Uploading media...");
          try {
            const uploadPromises = mediaFiles.map((file) =>
              uploadMediaForFeedback(feedbackId, file, accessToken)
            );
            await Promise.all(uploadPromises);
            toast.success("Feedback and media submitted successfully!");
          } catch (uploadError) {
            toast.error(
              `Feedback submitted, but media upload failed: ${uploadError.message}`
            );
          }
        } else {
          toast.success("Feedback submitted successfully!");
        }

        // Navigate back to history or another relevant page
        navigate("/personal/history");
      },
      onError: (err) => {
        toast.error(`Failed to submit feedback: ${err.message}`);
      },
    });
  };

  // --- Handle loading and error states ---
  if (isBookingLoading) {
    return <LoadingSpinner />;
  }

  if (isBookingError || !bookingId || !carwashId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Error Loading Booking
        </h1>
        <p className="text-gray-600 mb-4">
          Could not retrieve booking details. The link may be invalid or
          expired.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract display data from the fetched details
  const { carwashName, carwashImage } = bookingDetails || {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full -ml-2"
            aria-label="Go back"
          >
            <FaChevronLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Feedback for Service
          </h1>
          <div className="w-6" /> {/* Spacer to help center the title */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Carwash Details */}
        <div className="flex items-center">
          <img
            src={
              carwashImage || `https://ui-avatars.com/api/?name=${carwashName}`
            }
            alt="Carwash"
            className="w-14 h-14 rounded-full mr-4 object-cover"
          />
          <div>
            <p className="text-sm text-gray-500">Feedback for</p>
            <div className="text-xl font-semibold text-gray-900">
              {carwashName || "Carwash"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-center text-gray-700 font-medium mb-3">
              Your overall rating
            </label>
            {/* Star Rating */}
            <div className="flex justify-center items-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="text-4xl focus:outline-none transition-transform transform hover:scale-110 mx-1"
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHover(num)}
                  onMouseLeave={() => setHover(rating)}
                  aria-label={`Rate ${num}`}
                >
                  <FaStar
                    className={
                      num <= (hover || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Add a comment
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddSuggestion(tag)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <textarea
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none transition"
            placeholder="Share more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Media Upload & Previews */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Add photos or videos
            </label>
            <div className="mb-6">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative w-full aspect-square">
                    {p.type.startsWith("video/") ? (
                      <video
                        src={p.url}
                        className="w-full h-full object-cover rounded-lg bg-black"
                      />
                    ) : (
                      <img
                        src={p.url}
                        alt={`Preview ${idx}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removePreview(idx)}
                      className="absolute -top-1 -right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5"
                    >
                      <FaTimes size={12} />
                    </button>
                    {p.type.startsWith("video/") && (
                      <FaPlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl opacity-70 pointer-events-none" />
                    )}
                  </div>
                ))}
                {mediaFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-500 transition"
                  >
                    <FaCamera size={24} />
                    <span className="text-xs mt-1">Add Media</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="fileUpload"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-red-400"
            disabled={isCreatingFeedback}
          >
            {isCreatingFeedback ? "Submitting..." : "Submit Feedback"}
          </button>

          {/* Display submission error message */}
          {createError && (
            <p className="text-center text-sm text-red-600 mt-2">
              Failed to submit: {createError.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
