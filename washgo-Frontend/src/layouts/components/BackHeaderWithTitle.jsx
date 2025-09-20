import React from "react";
import { useLocation } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

const BackHeaderWithTitle = ({ title, onBackClick }) => {
  const location = useLocation();

  // Function to derive a title from the URL path if no title prop is provided
  const getTitleFromPath = (pathname) => {
    if (pathname.includes("/special-offers")) return "Offers";
    if (pathname.includes("/feedback")) return "Feedback";
    if (pathname.includes("/booking")) return "Booking Details";
    if (pathname.includes("/history")) return "History";
    // You can add more rules here in the future

    // Fallback to capitalizing the last segment of the URL if it's not a number
    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && isNaN(lastSegment)) {
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }

    return "WashGo"; // A generic fallback title
  };

  // Use the provided title prop, or derive it from the URL
  const headerTitle = title || getTitleFromPath(location.pathname);

  const handleBack = onBackClick || (() => window.history.back());

  return (
    <header className="bg-[#cc0000] text-white h-14 px-4 flex items-center shadow-md sticky top-0 z-10">
      <button
        onClick={handleBack}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-800 transition"
        aria-label="Go back"
      >
        <FaChevronLeft size={18} />
      </button>
      <div className="w-full text-center">
        <h1 className="text-xl font-semibold text-white">{headerTitle}</h1>
      </div>
      {/* Spacer to ensure title is perfectly centered */}
      <div className="w-8"></div>
    </header>
  );
};

export default BackHeaderWithTitle;
