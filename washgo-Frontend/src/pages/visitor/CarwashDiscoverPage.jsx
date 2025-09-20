import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/useLocation";
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock } from "react-icons/fa";

// --- Helper Functions ---

// Calculates distance between two lat/lon points in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Checks if a car wash is currently open
const getOpenStatus = (from, to) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [fromHour, fromMinute] = from.split(":").map(Number);
  const fromTime = fromHour * 60 + fromMinute;

  const [toHour, toMinute] = to.split(":").map(Number);
  const toTime = toHour * 60 + toMinute;

  return currentTime >= fromTime && currentTime <= toTime;
};

// --- Components ---

// A simple skeleton loader for a better loading experience
const CarwashCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

const CarwashDiscoverPage = () => {
  const { discoverType } = useParams(); // e.g., 'nearby' or 'best-rated'
  const navigate = useNavigate();
  const { latitude, longitude } = useLocation();

  const [carwashes, setCarwashes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!latitude || !longitude) return;

      setIsLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const params = new URLSearchParams({
        latitude,
        longitude,
      });

      // Configure API call based on the URL parameter
      if (discoverType === "nearby") {
        setTitle("Nearby Stations");
      } else if (discoverType === "best-rated") {
        setTitle("Best Rated Stations");
        params.append("minRating", 4);
      } else {
        setTitle("Discover");
        setError("Unknown discovery type.");
        setIsLoading(false);
        return;
      }

      try {
        const url = `${apiUrl}/api/filter?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        setCarwashes(data);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [discoverType, latitude, longitude]);

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <CarwashCardSkeleton key={index} />
      ));
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      );
    }

    if (carwashes.length === 0) {
      return (
        <div className="text-center py-10 px-4">
          <p className="text-gray-600">No car wash stations found.</p>
        </div>
      );
    }

    // THE CHANGE: New card design with more details
    return carwashes.map((carwash) => {
      const isOpen = getOpenStatus(carwash.from, carwash.to);
      const distance = getDistance(
        latitude,
        longitude,
        carwash.latitude,
        carwash.longitude
      );

      return (
        <div
          key={carwash.id}
          onClick={() => navigate(`/carwash/${carwash.id}`)}
          className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
        >
          <div className="h-32 w-full">
            <img
              src={
                carwash.imageUrl ||
                `https://via.placeholder.com/400x200/cccccc/808080?text=WashGo`
              }
              alt={carwash.carwashName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {carwash.carwashName}
              </h3>
              <div className="flex items-center flex-shrink-0">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold text-gray-800">
                  {parseFloat(carwash.averageRating).toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 flex items-center mb-3">
              <FaMapMarkerAlt className="mr-2 flex-shrink-0 text-gray-400" />
              {carwash.location}
            </p>
            <div className="flex justify-between items-center text-sm">
              <span
                className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>
              <span className="text-gray-500 font-medium">
                {distance.toFixed(1)} km away
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 mr-2 -ml-2"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-xl text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </header>
      {/* THE CHANGE: Added padding and spacing for the main content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default CarwashDiscoverPage;
