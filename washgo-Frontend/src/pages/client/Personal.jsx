import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/layouts/components/UserFooter";
import { useLocation } from "@/hooks/useLocation";
import {
  FaEdit,
  FaHistory,
  FaTicketAlt,
  FaStar,
  FaClipboardList,
  FaBell,
  FaSignOutAlt,
  FaHeadset,
  FaGlobe,
  FaChevronDown,
} from "react-icons/fa";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useUserAvatar } from "@/hooks/useUserAvatar"; // Import the new hook

// Hàm giải mã userId từ accessToken (JWT, base64url)
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}

const loading = false;

export default function Personal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const { accessToken } = useTokenRefresh();
  const { avatarUrl } = useUserAvatar(); // Use the new hook to get the avatar URL

  const { latitude, longitude, requestLocationChange } = useLocation();

  const userId = getUserIdFromToken(accessToken);

  useEffect(() => {
    if (loading || !userId) return;
    fetch(`http://localhost:8080/api/user/ClientInformation?userId=${userId}`, {
      method: "GET",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        setFormData(data);
      })
      .catch((err) => console.error("Error fetching user data:", err))
      .finally(() => {
        if (latitude && longitude) {
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
            .then((response) => response.json())
            .then((data) => {
              setFormData((prev) => ({
                ...prev,
                location: data.display_name || "Unknown Location",
              }));
            })
            .catch((error) => {
              console.error("Error fetching location:", error);
            });
        }
      });
  }, [loading, userId, accessToken]);

  const handleEditLocation = () => {
    requestLocationChange();
    navigate("/map");
  };

  const onLogoutClick = () => {
    setFormData({});
    navigate("/logout");
  };

  const bookingDetails = [
    { label: "Your Payment", icon: <FaClipboardList size={25} /> },
    { label: "History", icon: <FaHistory size={25} /> },
    { label: "Voucher", icon: <FaTicketAlt size={25} /> },
    { label: "Rating", icon: <FaStar size={25} /> },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col pb-16">
      {/* Header + Avatar */}
      <div className="bg-[#cc0000] text-white px-5">
        <div className="flex items-center justify-center space-x-4 pt-1">
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>

        {/* Avatar + Name */}
        <div
          className="flex items-center gap-4 pb-3 cursor-pointer"
          onClick={() => navigate("/userProfile")}
          title="View & Edit Profile"
        >
          <img
            src={
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${
                formData.userName || "U"
              }&background=random`
            }
            alt="Profile Avatar"
            className="w-14 h-14 rounded-full object-cover bg-gray-300 shadow-md hover:ring-2 hover:ring-white transition"
          />
          <div className="flex flex-col">
            <div className="font-medium text-white flex items-center gap-2">
              <span>{formData.userName || "[Username]"}</span>
              <FaEdit size={18} className="text-white/80" />
            </div>
            <p className="text-sm text-white/80">{formData.gmail || "Gmail"}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-4 flex-1 space-y-5">
        {/* Location */}
        <div
          className="bg-gray-100 p-4 rounded-lg"
          onClick={handleEditLocation}
        >
          <p className="text-sm text-gray-500">Your Current Area</p>
          <p className="text-base font-medium text-gray-800">
            {formData.location}
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-800">Booking Details</p>
            <a href="#" className="text-red-600 text-sm font-medium">
              See All
            </a>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {bookingDetails.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => {
                  if (item.label === "Your Payment") {
                    navigate("/payment");
                  } else if (item.label === "History") {
                    navigate("/personal/history");
                  } else if (item.label === "Voucher") {
                    navigate("/voucher");
                  } else if (item.label === "Rating") {
                    navigate("/rating");
                  }
                }}
              >
                <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center rounded-full">
                  {item.icon}
                </div>
                <p
                  className="mt-2 font-semibold text-black text-[12px] uppercase tracking-wide"
                  style={{ minHeight: 18, lineHeight: "18px" }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="">
          {/* Contact Support */}
          <div className="flex items-center justify-between min-h-[44px]">
            <label className="text-sm text-gray-800 flex items-center gap-2">
              <FaHeadset className="text-gray-400" size={18} />
              Contact Support
            </label>
            {/* Có thể thêm nút hoặc để trống */}
            <span />
          </div>

          {/* Notification toggle */}
          <div className="flex items-center justify-between min-h-[44px]">
            <label className="text-sm text-gray-800 flex items-center gap-2">
              <FaBell className="text-gray-400" size={18} />
              Allow Notifications
            </label>
            <button
              type="button"
              aria-pressed={formData.allowNotification}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  allowNotification: !prev.allowNotification,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                formData.allowNotification ? "bg-[#cc0000]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  formData.allowNotification ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center justify-between min-h-[44px]">
            <label className="text-sm text-gray-800 flex items-center gap-2">
              <FaGlobe className="text-gray-400" size={18} />
              Language
            </label>
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2c2c2] bg-white pr-8 transition"
                value={formData.language || "en"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
              <FaChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={14}
              />
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-15" />
        <button
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#cc0000] hover:bg-red-700 text-white font-semibold text-base shadow-sm transition cursor-pointer"
          onClick={onLogoutClick}
        >
          <FaSignOutAlt className="text-lg" />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-inner">
        <Footer />
      </div>
    </div>
  );
}
