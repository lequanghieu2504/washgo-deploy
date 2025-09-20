import React from "react";
import { FaChevronLeft, FaStar } from "react-icons/fa";

const mockRatings = [
  {
    id: 1,
    carwash: "Alo Carwash",
    service: "Exterior Wash",
    rating: 5,
    comment: "Very good service!",
    date: "2025-06-10",
  },
  {
    id: 2,
    carwash: "WashGo",
    service: "Interior Cleaning",
    rating: 4,
    comment: "Clean and fast.",
    date: "2025-06-01",
  },
];

export default function Rating() {
  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header giống Just Booked */}
      <div className="bg-[#cc0000] text-white py-4 px-4 flex items-center shadow-md relative">
        <button
          onClick={() => window.history.back()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-800 transition"
        >
          <FaChevronLeft size={18} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-xl font-semibold text-white">Rating</h1>
        </div>
      </div>
      <div className="p-3 space-y-4">
        {mockRatings.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{item.carwash}</span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <div className="text-sm text-gray-600">{item.service}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < item.rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <div className="text-gray-700 mt-2">{item.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}