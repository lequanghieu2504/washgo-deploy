import React from "react";

function PublicCarwashDetail({ lat, lon }) {
  const handleViewOnMap = () => {
    if (lat && lon) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-800">
        Non-Partner Location
      </h3>

      <p className="text-gray-600 mt-2">
        This location is not an official WashGo partner. Information is from
        public sources and may not be up-to-date.
      </p>

      <div className="mt-6">
        <button
          onClick={handleViewOnMap}
          disabled={!lat || !lon}
          className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          View on Google Maps
        </button>
      </div>
    </div>
  );
}

export default PublicCarwashDetail;
