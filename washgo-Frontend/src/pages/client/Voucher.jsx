import React from "react";
import { FaChevronLeft, FaTicketAlt } from "react-icons/fa";

const mockVouchers = [
  {
    id: 1,
    code: "SUMMER2025",
    desc: "Giảm 20% cho mọi dịch vụ",
    expiry: "2025-08-31",
  },
  {
    id: 2,
    code: "WASHGO10",
    desc: "Giảm 10% cho đơn trên 100.000đ",
    expiry: "2025-12-31",
  },
];

export default function Voucher() {
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
          <h1 className="text-xl font-semibold text-white">Voucher</h1>
        </div>
      </div>
      <div className="p-3 space-y-4">
        {mockVouchers.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow flex items-center gap-4 p-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#cc0000] text-white text-2xl">
              <FaTicketAlt />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{item.code}</div>
              <div className="text-sm text-gray-600">{item.desc}</div>
              <div className="text-xs text-gray-400">HSD: {item.expiry}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}