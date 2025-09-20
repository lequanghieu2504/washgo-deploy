import React, { useState, useEffect } from "react";
import { useFilterCarwash } from "@/hooks/useFilterCarwash";
import { useLocation } from "@/hooks/useLocation";
import { FaTimes } from "react-icons/fa";

const FilterBox = ({ searchParam, className = "" }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const { latitude, longitude } = useLocation();
  const { applyFilters, query } = useFilterCarwash();

  useEffect(() => {
    setSelectedTime(query.desiredTime || "");
    setSelectedServices(query.category || []);

    if (query.location) {
      setSearchLocation(query.location);
      setUseCurrentLocation(false);
    } else {
      setSearchLocation("");
      setUseCurrentLocation(true);
    }
  }, [query]);

  const handleLocationButtonClick = () => {
    if (searchLocation) {
      setSearchLocation("");
      setUseCurrentLocation(true);

      const params = buildFilterParamsWithLocation(true, "");
      applyFilter(params);
    } else {
      const newUseCurrentLocation = !useCurrentLocation;
      setUseCurrentLocation(newUseCurrentLocation || !searchLocation);

      const params = buildFilterParamsWithLocation(newUseCurrentLocation, "");
      applyFilter(params);
    }
  };

  const buildFilterParamsWithLocation = (useCurrent, customLocation) => {
    const params = {};

    // Only add desiredTime to params if it has a value.
    if (selectedTime) {
      params.desiredTime =
        selectedTime.includes(":") && selectedTime.split(":").length === 2
          ? `${selectedTime}:00`
          : selectedTime;
    }

    if (searchParam) params.carwashName = searchParam.trim();

    if (useCurrent && latitude != null && longitude != null) {
      params.latitude = latitude.toString();
      params.longitude = longitude.toString();
      params.location = null;
    } else if (customLocation) {
      params.location = customLocation.trim();
      params.latitude = null;
      params.longitude = null;
    } else {
      params.latitude = latitude?.toString() || null;
      params.longitude = longitude?.toString() || null;
      params.location = null;
    }

    if (selectedServices.length > 0) params.category = selectedServices;
    return params;
  };

  const applyFilter = (params) => {
    applyFilters(params);
  };

  const removeFilter = (key) => {
    // Create a mutable copy of the current filters
    const newParams = buildFilterParams();

    if (key === "desiredTime") {
      setSelectedTime("");
      // Remove the key from the params object instead of setting it to null
      delete newParams.desiredTime;
    }
    if (key === "category") {
      setSelectedServices([]);
      delete newParams.category;
    }
    if (key === "location") {
      setSearchLocation("");
      setUseCurrentLocation(true);
      delete newParams.location;
      newParams.latitude = latitude?.toString();
      newParams.longitude = longitude?.toString();
    }

    applyFilter(newParams);
  };

  const categories = [
    "Basic Wash",
    "Premium Wash",
    "Interior Cleaning",
    "Waxing",
    "Detailing",
  ];

  const buildFilterParams = () => {
    return buildFilterParamsWithLocation(useCurrentLocation, searchLocation);
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString) return "Time";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  return (
    <div className={`w-full h-full p-3 relative ${className}`}>
      {/* Filter Buttons */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {/* Time Button */}
        <div className="relative">
          <button
            onClick={() => setShowTimePicker(true)}
            className={`px-3 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors ${
              selectedTime
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white/80 backdrop-blur-sm border-gray-300 text-gray-600 hover:bg-white/90"
            }`}
          >
            {formatDisplayTime(selectedTime)}
            {selectedTime && (
              <span
                className="ml-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFilter("desiredTime");
                }}
              >
                <FaTimes size={10} />
              </span>
            )}
          </button>
        </div>

        {/* Category Button */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(true)}
            className={`px-3 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors ${
              selectedServices.length > 0
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white/80 backdrop-blur-sm border-gray-300 text-gray-600 hover:bg-white/90"
            }`}
          >
            {selectedServices.length > 0
              ? `${selectedServices.length} selected`
              : "Category"}
            {selectedServices.length > 0 && (
              <span
                className="ml-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFilter("category");
                }}
              >
                <FaTimes size={10} />
              </span>
            )}
          </button>
        </div>

        {/* Current Location Button */}
        <div className="relative">
          <button
            onClick={handleLocationButtonClick}
            className={`px-3 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors ${
              useCurrentLocation
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-white/80 backdrop-blur-sm border-gray-300 text-gray-600 hover:bg-white/90"
            }`}
          >
            Current
          </button>
        </div>

        {/* Search Location Button */}
        <div className="relative">
          <button
            onClick={() => setShowLocationSearch(true)}
            className={`px-3 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors ${
              searchLocation
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "bg-white/80 backdrop-blur-sm border-gray-300 text-gray-600 hover:bg-white/90"
            }`}
          >
            {searchLocation ? "Custom" : "Location"}
            {searchLocation && (
              <span
                className="ml-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();

                  setSearchLocation("");
                  setUseCurrentLocation(true);

                  const params = buildFilterParamsWithLocation(true, "");
                  applyFilter(params);
                }}
              >
                <FaTimes size={10} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 w-full max-w-sm transform -translate-y-8">
            <h3 className="text-lg font-medium mb-4 text-center">
              Select Time
            </h3>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg text-center"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                onClick={() => setShowTimePicker(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={() => {
                  setShowTimePicker(false);
                  const params = buildFilterParams();
                  applyFilter(params);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Picker Modal */}
      {showCategoryDropdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 w-full max-w-md transform -translate-y-8">
            <h3 className="text-lg font-medium mb-4 text-center">
              Select Categories
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {categories.map((service) => (
                <label
                  key={service}
                  className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, service]);
                      } else {
                        setSelectedServices(
                          selectedServices.filter((s) => s !== service)
                        );
                      }
                    }}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                onClick={() => setShowCategoryDropdown(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={() => {
                  setShowCategoryDropdown(false);
                  const params = buildFilterParams();
                  applyFilter(params);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Search Modal */}
      {showLocationSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 w-full max-w-sm transform -translate-y-8">
            <h3 className="text-lg font-medium mb-4 text-center">
              Enter Location
            </h3>
            <input
              type="text"
              placeholder="Enter location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                onClick={() => setShowLocationSearch(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={() => {
                  setShowLocationSearch(false);
                  if (searchLocation.trim()) {
                    setUseCurrentLocation(false);
                    const params = buildFilterParamsWithLocation(
                      false,
                      searchLocation
                    );
                    applyFilter(params);
                  } else {
                    setUseCurrentLocation(true);
                    const params = buildFilterParamsWithLocation(true, "");
                    applyFilter(params);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBox;
