import React, { useState, useMemo } from "react";
import {
  FaChevronLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { useClientBookingHistory } from "@/hooks/useClientBookingHistory";
import { useNavigate } from "react-router-dom";
import BookingHistoryItem from "@/components/common/BookingHistoryItem";

// Centralized configuration for status display
const statusConfig = {
  DONE: {
    text: "Completed",
    color: "text-green-600",
    icon: <FaCheckCircle />,
  },
  CANCEL: {
    text: "Cancelled",
    color: "text-red-500",
    icon: <FaTimesCircle />,
  },
  PENDING: {
    text: "Upcoming",
    color: "text-blue-500",
    icon: <FaClock />,
  },
  ACCEPTED: {
    text: "Upcoming",
    color: "text-blue-500",
    icon: <FaClock />,
  },
};

function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function History() {
  const [tab, setTab] = useState("All");
  const { data, isLoading, isError } = useClientBookingHistory();
  const navigate = useNavigate();

  // Transform API data to display format
  const bookings = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((booking) => {
      // Create a comma-separated string of all service names in the booking.
      const serviceName =
        booking.listProductDTO?.map((p) => p.name).join(", ") || "Service";

      // Calculate total price from all products in the booking
      const price =
        booking.listProductDTO?.reduce(
          (sum, p) => sum + (p.pricing?.price || 0),
          0
        ) || 0;

      return {
        id: booking.bookingId,
        carwashId: booking.carwashId,
        carwashName: booking.carwashName || `Carwash #${booking.carwashId}`,
        status: booking.status, // Use status directly from API
        feedbacked: booking.feedbacked, // Add the new feedbacked field
        serviceName,
        time: formatDateTime(booking.startTime),
        price,
        // The image is now handled by the item component
      };
    });
  }, [data]);

  // Filter logic now uses the status text from the config
  const filtered =
    tab === "All"
      ? bookings
      : bookings.filter((h) => statusConfig[h.status]?.text === tab);

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-[#cc0000] text-white py-4 px-4 flex items-center shadow-md relative">
        <button
          onClick={() => window.history.back()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-800 transition"
        >
          <FaChevronLeft size={18} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-xl font-semibold text-white">History</h1>
        </div>
      </div>

      {/* Tabs - Updated to include "Upcoming" */}
      <div className="flex shadow-sm bg-white">
        {["All", "Upcoming", "Completed", "Cancelled"].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === t ? "text-[#cc0000] bg-gray-100" : "text-gray-600"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="p-3 space-y-4">
        {isLoading && (
          <div className="text-center text-gray-400 py-10">Loading...</div>
        )}
        {isError && (
          <div className="text-center text-red-400 py-10">
            Failed to load history.
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            No history found.
          </div>
        )}
        {filtered.map((item) => (
          <BookingHistoryItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
