import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useClientProfileImage } from "@/hooks/useClientProfileImage";
import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ImageUploadPreview from "@/components/common/ImageUploadPreview"; // Import the new modal

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

export default function ProfileEdit() {
  const [formData, setFormData] = useState({
    id: "",
    userName: "",
    gmail: "",
    phonenumber: "",
    gender: "",
    birthDay: "",
  });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { accessToken } = useTokenRefresh();
  const navigate = useNavigate();

  // --- Hooks for Avatar ---
  const { avatarUrl, updateAvatar, isUploading, isFetchingAvatar } =
    useClientProfileImage();
  const fileInputRef = useRef(null);

  // --- State for Modal ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy userId từ accessToken
  const userId = getUserIdFromToken(accessToken);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Không thể lấy thông tin người dùng.");
        setLoading(false);
      });
  }, [userId, accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(
        "http://localhost:8080/api/user/updateClientInformation",
        {
          method: "POST",
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: formData.id,
            userName: formData.userName,
            gender: formData.gender ? formData.gender.toUpperCase() : "",
            birthDay: formData.birthDay,
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      setSuccessMsg("Cập nhật thông tin thành công!");
    } catch (err) {
      setErrorMsg("Cập nhật thất bại.");
    }
  };

  // --- Handlers for Avatar Upload ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Check if file size is less than 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 10MB.");
        return;
      }
      setSelectedFile(file);
      setIsModalOpen(true);
    }
    // Reset the input value to allow re-selecting the same file
    event.target.value = null;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  if (loading) return <div className="p-6">Đang tải thông tin...</div>;

  return (
    <>
      <ImageUploadPreview
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
        onUpload={updateAvatar}
        isUploading={isUploading}
      />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-[#cc0000] text-white flex items-center justify-between px-4 py-2">
          <button
            onClick={() => navigate("/personal")}
            className="flex items-center justify-center text-white"
          >
            <FaChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <div className="w-9 h-9" />
        </div>

        <div className="max-w-2xl mx-auto p-5 space-y-6">
          {/* --- Avatar Section (Updated) --- */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={
                  avatarUrl ||
                  `https://ui-avatars.com/api/?name=${
                    formData.userName || "U"
                  }&background=random`
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                onClick={handleAvatarClick}
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition shadow-sm"
                aria-label="Change avatar"
                disabled={isUploading || isFetchingAvatar}
              >
                {isUploading || isFetchingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera size={12} />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
            <div>
              <p className="text-gray-800 font-medium">
                {formData.userName || "[Username]"}
              </p>
              <p className="text-gray-500 text-sm">
                {formData.gmail || "Gmail"}
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <input
              type="email"
              name="gmail"
              value={formData.gmail}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500"
            />

            {/* Username (cho phép sửa) */}
            <input
              type="text"
              name="userName"
              value={formData.userName}
              placeholder="Username"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />

            <input
              type="text"
              name="phonenumber"
              value={formData.phonenumber}
              placeholder="Phone number"
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500"
            />

            {/* Gender */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={handleChange}
                />
                Male
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={handleChange}
                />
                Female
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={formData.gender === "OTHER"}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>

            {/* Date of birth */}
            <input
              type="date"
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />

            {/* Change password */}
            <div className="text-right">
              <button
                className="text-[#cc0000] text-sm font-medium hover:underline cursor-pointer"
                onClick={() => navigate("/change-password")}
              >
                Change password
              </button>
            </div>

            {/* Update button */}
            <button
              onClick={handleUpdate}
              className="w-full bg-[#cc0000] text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Update
            </button>

            {/* Success/Error message */}
            {successMsg && (
              <div className="text-green-600 text-center">{successMsg}</div>
            )}
            {errorMsg && (
              <div className="text-red-600 text-center">{errorMsg}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
