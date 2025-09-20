import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { useCarwashRouteToMap } from "@/hooks/useCarwashRouteToMap";

const CarwashCard = ({ carwash }) => {
  const navigate = useNavigate();
  const { setCarwashForMap } = useCarwashRouteToMap();
  // Use the hook to get the avatar for the specific carwash ID
  const { avatarUrl } = useUserAvatar(carwash.id);

  const fallbackAvatar = `https://via.placeholder.com/200x150/cccccc/808080?text=${encodeURIComponent(
    carwash.carwashName
  )}`;

  const handleCardClick = () => {
    setCarwashForMap(carwash);
    navigate("/map");
  };

  return (
    <div
      className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 w-60 flex-shrink-0 snap-start hover:shadow-md transition duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        src={avatarUrl || fallbackAvatar}
        alt={carwash.carwashName}
        className="w-full h-32 rounded-lg object-cover mb-3 bg-gray-200"
      />
      <h4 className="text-md font-semibold text-gray-900 truncate">
        {carwash.carwashName}
      </h4>
      <p className="text-sm text-gray-500 truncate">{carwash.location}</p>
      <div className="flex items-center mt-1">
        <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
        <span className="text-sm font-medium text-gray-700">
          {parseFloat(carwash.averageRating).toFixed(1)}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        🕒 {carwash.from.slice(0, 5)} - {carwash.to.slice(0, 5)}
      </p>
    </div>
  );
};

export default CarwashCard;
