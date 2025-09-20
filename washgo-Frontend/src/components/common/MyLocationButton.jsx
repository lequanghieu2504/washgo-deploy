import React, { useRef } from "react";

const MyLocationButton = ({ mapRef, location, onLongPress }) => {
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  const handlePointerDown = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (onLongPress) {
        onLongPress();
      }
    }, 700); // 700ms for a long press
  };

  const handlePointerUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleClick = () => {
    // Prevent click from firing after a long press
    if (isLongPress.current) {
      return;
    }
    if (mapRef.current && location) {
      mapRef.current.setView(location, 15);
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={`bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 active:scale-95 transition-all duration-300 ease-in-out`}
      aria-label="Center map on my location. Press and hold to reset manual location."
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-blue-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    </button>
  );
};

export default MyLocationButton;
