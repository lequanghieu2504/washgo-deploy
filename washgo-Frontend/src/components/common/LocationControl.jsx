import React, { useState, useEffect } from "react";
import { useLocation } from "@/hooks/useLocation";

// Simple Location Prompt Component
const LocationPrompt = ({ onClick, onClose }) => {
  return (
    <div className="fixed top-16 left-4 right-4 z-[49] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-3 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={onClick}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-[#cc0000] transition-colors flex-1"
          >
            <i className="fas fa-map-marker-alt text-[#cc0000]"></i>
            <span>Click here to change your location</span>
          </button>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Manual Location Setter Component
const ManualLocationSetter = ({ mapRef, onConfirm }) => {
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const updateCenter = () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    };

    // Update center initially
    updateCenter();

    // Update center when map moves
    map.on("move", updateCenter);

    return () => {
      map.off("move", updateCenter);
    };
  }, [mapRef]);

  return (
    <>
      {/* Crosshair in center of map */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] pointer-events-none">
        <div className="relative">
          <i className="fas fa-crosshairs text-[#cc0000] text-2xl drop-shadow-lg"></i>
        </div>
      </div>

      {/* Simple Confirmation Button */}
      <div className="fixed top-16 left-4 right-4 z-[1000] animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-3 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onConfirm(mapCenter)}
              disabled={!mapCenter}
              className="flex items-center space-x-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] px-4 py-2 rounded-full transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-check"></i>
              <span>Confirm location</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Main LocationControl Component
const LocationControl = ({ mapRef }) => {
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);

  const { locationChangeRequested, setLocation, clearLocationChangeRequest } =
    useLocation();

  useEffect(() => {
    if (locationChangeRequested) {
      setShowLocationPrompt(true);
    } else {
      setShowLocationPrompt(false);
      setIsManualLocationMode(false);
    }
  }, [locationChangeRequested]);

  // Handle location prompt click
  const handleLocationPromptClick = () => {
    setShowLocationPrompt(false);
    setIsManualLocationMode(true);
  };

  // Handle manual location confirmation
  const handleManualLocationConfirm = (location) => {
    setLocation({
      latitude: location[0],
      longitude: location[1],
    });
    console.log("Manual location set:", location);

    setIsManualLocationMode(false);
    clearLocationChangeRequest();
  };

  // Handle prompt close
  const handlePromptClose = () => {
    setShowLocationPrompt(false);
    clearLocationChangeRequest();
  };

  return (
    <>
      {/* Simple Location Prompt */}
      {showLocationPrompt && (
        <LocationPrompt
          onClick={handleLocationPromptClick}
          onClose={handlePromptClose}
        />
      )}

      {/* Manual Location Setter */}
      {isManualLocationMode && (
        <ManualLocationSetter
          mapRef={mapRef}
          onConfirm={handleManualLocationConfirm}
        />
      )}
    </>
  );
};

export default LocationControl;
