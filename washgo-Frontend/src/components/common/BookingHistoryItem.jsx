import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { useUserAvatar } from "@/hooks/useUserAvatar";

// Status configuration can be shared or defined here
const statusConfig = {
  DONE: { text: "Completed", color: "text-green-600", icon: <FaCheckCircle /> },
  CANCEL: { text: "Cancelled", color: "text-red-500", icon: <FaTimesCircle /> },
  PENDING: { text: "Upcoming", color: "text-blue-500", icon: <FaClock /> },
  ACCEPTED: { text: "Upcoming", color: "text-blue-500", icon: <FaClock /> },
};

const BookingHistoryItem = ({ item }) => {
  const navigate = useNavigate();
  // Use the hook to get the avatar for the specific carwash
  const { avatarUrl } = useUserAvatar(item.carwashId);

  const currentStatus = statusConfig[item.status] || statusConfig.PENDING;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    item.carwashName
  )}&background=0D8ABC&color=fff`;

  return (
    <div
      className="bg-white rounded-xl shadow flex flex-col p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() =>
        navigate(`/personal/history/${item.id}`, {
          state: { bookingId: item.id },
        })
      }
    >
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl || fallbackAvatar}
          alt="carwash avatar"
          className="w-14 h-14 rounded-lg object-cover bg-gray-200"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">
              {item.carwashName}
            </span>
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${currentStatus.color}`}
            >
              {currentStatus.icon}
              {currentStatus.text}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">{item.serviceName}</div>
          <div className="text-xs text-gray-400">{item.time}</div>
          <div className="text-sm font-medium text-[#cc0000] mt-1">
            {item.price.toLocaleString()} VND
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      {item.status === "DONE" &&
        (item.feedbacked ? (
          <button
            className="mt-3 ml-auto flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-500 text-white text-sm font-semibold shadow hover:bg-gray-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/personal/history/${item.id}`);
            }}
          >
            View feedback
          </button>
        ) : (
          <button
            className="mt-3 ml-auto flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/feedback/carwash/${item.carwashId}/booking/${item.id}`
              );
            }}
          >
            Leave feedback
          </button>
        ))}
    </div>
  );
};

export default BookingHistoryItem;
