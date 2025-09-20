import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useShowGlobalFilterState } from "@/hooks/useShowGlobalFilterState";
import { useLocation } from "@/hooks/useLocation";
import { useCarwashRouteToMap } from "@/hooks/useCarwashRouteToMap";
import CarwashCard from "@/components/common/CarwashCard"; // Import the new component

function Home() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const { setIsExpanded, setShowFilter } = useShowGlobalFilterState();

  const [bestRatedCarwashes, setBestRatedCarwashes] = useState([]);
  const [isLoadingBestRated, setIsLoadingBestRated] = useState(true);
  const [errorBestRated, setErrorBestRated] = useState(null);

  const [nearbyCarwashes, setNearbyCarwashes] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);
  const [errorNearby, setErrorNearby] = useState(null);

  const { userData } = useTokenRefresh();
  const username = userData?.sub || "Guest";

  const { setCarwashForMap } = useCarwashRouteToMap();

  const navigate = useNavigate();
  const { latitude, longitude } = useLocation();

  const cuteQuotes = [
    "✨ Your car deserves to shine as bright as you do!",
    "🚗 A clean car is a happy car!",
    "💎 Sparkle and shine, it's car wash time!",
    "🌟 Life's too short for a dirty car!",
    "🎉 Ready to make your ride pristine?",
    "🌈 Every wash brings back that new car feeling!",
    "☀️ Let your car glow like the sunshine!",
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsAnimating(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      timeoutRef.current = setTimeout(() => {
        setCurrentQuoteIndex((prev) => {
          const nextIndex = (prev + 1) % cuteQuotes.length;
          return nextIndex;
        });
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchBestRated = async () => {
      if (!latitude || !longitude) return;

      setIsLoadingBestRated(true);
      setErrorBestRated(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

        const params = new URLSearchParams({
          minRating: 4,
          latitude: latitude,
          longitude: longitude,
        });
        const url = `${apiUrl}/api/filter?${params.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBestRatedCarwashes(data);
      } catch (error) {
        console.error("Failed to fetch best rated carwashes:", error);
        setErrorBestRated("Could not load stations. Please try again later.");
      } finally {
        setIsLoadingBestRated(false);
      }
    };

    fetchBestRated();
  }, [latitude, longitude]);

  useEffect(() => {
    const fetchNearby = async () => {
      if (!latitude || !longitude) return;

      setIsLoadingNearby(true);
      setErrorNearby(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const params = new URLSearchParams({
          latitude: latitude,
          longitude: longitude,
        });
        const url = `${apiUrl}/api/filter?${params.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNearbyCarwashes(data);
      } catch (error) {
        console.error("Failed to fetch nearby carwashes:", error);
        setErrorNearby("Could not load stations. Please try again later.");
      } finally {
        setIsLoadingNearby(false);
      }
    };

    fetchNearby();
  }, [latitude, longitude]);

  const quickActions = [
    {
      icon: "🔍",
      label: "Find Nearby",
      action: () => {
        navigate("/map");
        setIsExpanded(true);
        setShowFilter(true);
      },
    },
    {
      icon: "📅",
      label: "Book Now",
      action: () => navigate("/map"),
    },
    {
      icon: "⭐",
      label: "Best Rated",
      action: () => {
        navigate("/map");
      },
    },
    {
      icon: "💰",
      label: "Offers",
      action: () => navigate("/special-offers"),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Greeting */}
      <section className="bg-white px-4 pt-6 pb-8">
        <div>
          {/* Greeting */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Hi {username}! 👋
            </h1>

            {/* ✅ Quote with Tailwind roll-up animation */}
            <div className="overflow-hidden h-8 relative">
              <p
                className={`text-lg text-gray-700 font-medium block leading-8 transition-transform duration-600 ease-in-out ${
                  isAnimating
                    ? "animate-pulse transform -translate-y-full opacity-0"
                    : "transform translate-y-0 opacity-100"
                }`}
              >
                {cuteQuotes[currentQuoteIndex]}
              </p>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="flex justify-between space-x-4 max-w-sm mx-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center justify-center w-16 h-20 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-red-100 hover:border-red-200"
              >
                <span className="text-2xl mb-1">{action.icon}</span>
                <span className="text-xs text-gray-700 font-medium text-center leading-tight px-1">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="px-4">
        {/* Banner Section */}
        <section className="mb-8">
          <div className="relative h-32 w-full rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80"
              alt="Car Wash Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/80 to-transparent flex items-center">
              <div className="text-white px-6">
                <h3 className="text-xl font-bold mb-1">Special Offer</h3>
                <p className="text-lg font-semibold">20% OFF</p>
                <p className="text-sm opacity-90">First service booking</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Stations Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Nearby</h3>
            <button
              onClick={() => {
                navigate("/discover/nearby");
              }}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition duration-150"
            >
              See All
            </button>
          </div>
          {/* THE CHANGE: Render based on API call state */}
          {isLoadingNearby && <p>Loading nearby stations...</p>}
          {errorNearby && <p className="text-red-500">{errorNearby}</p>}
          {!isLoadingNearby &&
            !errorNearby &&
            (nearbyCarwashes.length > 0 ? (
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {nearbyCarwashes.map((carwash) => (
                    <CarwashCard key={carwash.id} carwash={carwash} />
                  ))}
                </div>
              </div>
            ) : (
              // THE CHANGE: Full-width empty state card
              <div
                onClick={() => navigate("/map")}
                className="w-full h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-600">
                  There are no carwashes near you, please use the map to see
                  more.
                </p>
              </div>
            ))}
        </section>

        {/* Best Rated Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Best Rated</h3>
            <button
              onClick={() => {
                navigate("/discover/best-rated");
              }}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition duration-150"
            >
              See All
            </button>
          </div>
          {/* THE CHANGE: Render based on API call state */}
          {isLoadingBestRated && <p>Loading best rated stations...</p>}
          {errorBestRated && <p className="text-red-500">{errorBestRated}</p>}
          {!isLoadingBestRated &&
            !errorBestRated &&
            (bestRatedCarwashes.length > 0 ? (
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {bestRatedCarwashes.map((carwash) => (
                    <CarwashCard key={carwash.id} carwash={carwash} />
                  ))}
                </div>
              </div>
            ) : (
              // THE CHANGE: Full-width empty state card
              <div
                onClick={() => navigate("/map")}
                className="w-full h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-600">
                  There are no carwashes near you, please use the map to see
                  more.
                </p>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}

export default Home;
