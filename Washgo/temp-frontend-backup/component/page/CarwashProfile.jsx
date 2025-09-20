import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

import ProductInfo from "../common/ProductInfo";
import { FeedbackDisplay } from "../common/FeebackDisplay";
import Stamp from "../common/Stamp";
import { Button } from "../ui";

function CarwashProfile() {
  const { id } = useParams(); // Get carwash ID from URL
  const [carwashDetails, setCarwashDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [showFeedback, setShowFeedBack] = useState(false);

  // Fetch Carwash Details based on ID
  useEffect(() => {
    if (!id) {
      setError("No carwash ID provided in the URL.");
      setIsLoading(false);
      return;
    }

    const fetchCarwashDetails = async () => {
      setIsLoading(true);
      setError(null);
      const accessToken = localStorage.getItem("accessToken"); // Get token if needed by API

      // Basic check if token exists (adjust based on API requirements)
      if (!accessToken) {
        setError("Authentication required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/carwashes/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          let errorMsg = `Failed to fetch carwash details: ${response.status}`;
          try {
            const errorData = await response.text(); // Try to get error text
            errorMsg += ` - ${errorData}`;
          } catch (e) {
            /* Ignore */
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setCarwashDetails(data);
      } catch (err) {
        console.error("Fetch carwash details error:", err);
        setError(err.message || "Could not load carwash details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarwashDetails();
  }, [id]); // Re-fetch if ID changes

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-gray-500">
        <i className="fas fa-spinner fa-spin mr-3 text-2xl text-[#cc0000]"></i>
        Loading Carwash Details...
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="m-6 p-6 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm text-center">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // --- Render Profile ---
  // Assuming this component is rendered within MainLayout, so no extra header needed here
  return (
    // Main container with padding
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {" "}
      {/* Use theme background */}
      {/* Carwash Details Card */}
      {carwashDetails ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto mb-8">
          {/* Carwash Name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center border-b pb-3">
            {carwashDetails.carwashName || "Car Wash"} {/* Fallback name */}
          </h1>

          {/* Details Section */}
          <div className="space-y-3 text-gray-700 text-sm sm:text-base">
            {/* Location */}
            <div className="flex items-start">
              <i className="fas fa-map-marker-alt w-5 text-center text-gray-400 mr-3 pt-1"></i>
              <span>{carwashDetails.location || "Location not available"}</span>
            </div>
            {/* Description */}
            <div className="flex items-start">
              <i className="fas fa-info-circle w-5 text-center text-gray-400 mr-3 pt-1"></i>
              <span>
                {carwashDetails.description || "No description provided."}
              </span>
            </div>
            {/* Rating */}
            <div className="flex items-start">
              <i className="fas fa-star w-5 text-center text-yellow-400 mr-3 pt-1"></i>
              <span>
                {carwashDetails.averageRating
                  ? `${parseFloat(carwashDetails.averageRating).toFixed(
                      1
                    )} / 5.0`
                  : "Not rated yet"}
                {/* Optionally add rating count: ` (${carwashDetails.ratingCount || 0} reviews)` */}
              </span>
            </div>
            <Button onClick={() => setShowFeedBack((prev) => !prev)}>
              FeedBack
            </Button>
            {showFeedback && <FeedbackDisplay />}
            {<Stamp />}
            {/* Add more details if available (e.g., phone, opening hours) */}
          </div>
        </div>
      ) : (
        // This case might not be reached if error state handles fetch failure,
        // but keep as a fallback.
        <p className="text-center text-gray-500 text-lg mt-10">
          Carwash details not found.
        </p>
      )}
      {/* Product Info Section */}
      {/* Render ProductInfo only if we have a valid ID */}
      {id && <ProductInfo carwashId={id} />}
    </div>
  );
}

// Add PropTypes
CarwashProfile.propTypes = {
  // No props expected as ID comes from useParams
};

export default CarwashProfile;
