import React, { useEffect, useRef, useState } from "react";
import { useTokenRefresh } from "@/hooks/useTokenRefresh"; // Import the hook
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const CarwashMedia = () => {
  // Use the hook to get session data
  const { accessToken, userData } = useTokenRefresh();
  // The carwashId is the userId of the currently logged-in carwash user
  const carwashId = userData?.userId;

  const [items, setItems] = useState([]);
  const fileRef = useRef(null);
  const [uploadLog, setUploadLog] = useState("");
  const [isCover, setIsCover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const avatarFileRef = useRef(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const API_BASE = "http://localhost:8080";

  const fetchCarwashMedia = async () => {
    // Guard against running without necessary data
    if (!carwashId || !accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/media/carwash/${carwashId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching media:", err);
      setItems([]);
    }
  };

  // --- New function to fetch avatar directly ---
  const fetchAvatar = async () => {
    if (!carwashId || !accessToken) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/media/users/${carwashId}/avatar`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // A 404 is expected if no avatar is set, not an error.
      if (res.status === 404) {
        setAvatarUrl("");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch avatar");

      const data = await res.json();
      // Prepend base URL to the relative path from the server
      setAvatarUrl(`${API_BASE}${data.url}`);
    } catch (err) {
      console.error("Error fetching avatar:", err);
      setAvatarUrl(""); // Reset on error
    }
  };

  // Helper function to get image URL using the media serving API
  const getImageUrl = (mediaId) => {
    return `${API_BASE}/api/media/serve/${mediaId}`;
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use the primary endpoint
      const endpoint = `${API_BASE}/api/media/carwash/${carwashId}?cover=${isCover}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        setUploadLog(`Upload successful`);
        fetchCarwashMedia(); // Refresh list
        if (isCover) fetchAvatar(); // If we uploaded a new cover, refetch the avatar
        if (fileRef.current) fileRef.current.value = ""; // Reset file input
        setPreviewUrl("");
        setIsCover(false);
      } else {
        throw new Error(`${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setUploadLog(
        `Upload failed: ${err.message}. Please check if the backend is running and the endpoint exists.`
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      if (fileRef.current) fileRef.current.value = "";
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please drop an image file");
      return;
    }
    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarPreviewUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      if (avatarFileRef.current) avatarFileRef.current.value = "";
      setAvatarPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreviewUrl(url);
  };

  const handleAvatarUpload = async () => {
    const file = avatarFileRef.current?.files?.[0];
    if (!file) {
      alert("Please select an image for avatar");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use USER AVATAR endpoint (carwashId == userId of carwash)
      const endpoint = `${API_BASE}/api/media/users/${carwashId}/avatar`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status} ${text}`);
      }

      // After successful upload, refetch the avatar to get the correct, served URL
      fetchAvatar();

      setUploadLog("Avatar uploaded successfully");
      if (avatarFileRef.current) avatarFileRef.current.value = "";
      setAvatarPreviewUrl("");
    } catch (err) {
      setUploadLog(
        `Avatar upload failed: ${err.message}. Please check if the backend is running and the endpoint exists.`
      );
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/media/carwash/${carwashId}/${mediaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      fetchCarwashMedia(); // Refresh list
      fetchAvatar(); // The deleted image might have been the avatar
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  useEffect(() => {
    // Ensure carwashId and token are available before fetching
    if (carwashId && accessToken) {
      fetchAvatar();
      fetchCarwashMedia();
    }
  }, [carwashId, accessToken]); // Re-run if carwashId or token changes

  // Display a loading or unauthenticated message while waiting for session data
  if (!carwashId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading user data or not authenticated...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Media Gallery</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your carwash profile images and gallery
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column - Avatar & Upload */}
          <div className="lg:col-span-4 space-y-6">
            {/* Avatar Section */}
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Carwash Avatar
              </h2>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative group">
                    {avatarPreviewUrl || avatarUrl ? (
                      <img
                        src={avatarPreviewUrl || avatarUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                        onError={(e) => {
                          console.error("Failed to load avatar image:", e);
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}

                    <label className="absolute bottom-0 right-0 bg-[#cc0000] hover:bg-[#a30000] text-white p-2 rounded-full shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        ref={avatarFileRef}
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleAvatarUpload}
                    disabled={
                      !avatarFileRef.current ||
                      !avatarFileRef.current.files?.length
                    }
                    className="w-full"
                  >
                    Save Profile Image
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Remove current profile image?")) {
                          fetch(
                            `${API_BASE}/api/media/users/${carwashId}/avatar`,
                            {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${accessToken}`,
                              },
                            }
                          )
                            .then((res) => {
                              if (!res.ok) throw new Error("Delete failed");
                              setAvatarUrl("");
                              setAvatarPreviewUrl("");
                              setUploadLog("Profile image removed");
                            })
                            .catch((err) =>
                              alert(`Delete failed: ${err.message}`)
                            );
                        }
                      }}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Upload a square image for best results
                </p>
              </div>
            </div>

            {/* Upload Section Button */}
            <div>
              <button
                onClick={() => setShowUpload((prev) => !prev)}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-lg p-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#cc0000] bg-opacity-10 rounded-lg p-2">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Add New Media</h3>
                    <p className="text-sm text-gray-500">
                      Upload to your gallery
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                    showUpload ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Collapsible Upload Form */}
            {showUpload && (
              <div className="bg-white shadow-sm rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-gray-900">Upload New Media</h3>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    border-2 ${
                      isDragging
                        ? "border-[#cc0000] bg-red-50"
                        : "border-dashed border-gray-300"
                    }
                    rounded-lg p-6 transition-colors duration-200
                  `}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
                          <svg
                            className="w-10 h-10 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">No Media</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Drag & drop image here</p>
                        <p className="text-gray-500">or</p>
                      </div>

                      <label className="inline-block mt-2 px-4 py-2 bg-[#cc0000] hover:bg-[#a30000] text-white text-sm rounded-lg cursor-pointer transition-colors duration-200">
                        Choose File
                        <input
                          type="file"
                          ref={fileRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    id="isCover"
                    type="checkbox"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="rounded text-[#cc0000] focus:ring-[#cc0000]"
                  />
                  <label htmlFor="isCover" className="text-sm text-gray-700">
                    Set as cover image
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Button
                    onClick={handleUpload}
                    disabled={
                      !fileRef.current || !fileRef.current.files?.length
                    }
                    className="w-full"
                  >
                    Upload Media
                  </Button>
                </div>

                {uploadLog && (
                  <div
                    className={`text-sm p-2 rounded ${
                      uploadLog.includes("successful")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {uploadLog}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Gallery Grid */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-medium text-gray-900">Gallery</h2>
                <span className="text-sm text-gray-500">
                  {items.filter((item) => !item.avatar).length} images
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items
                  .filter((item) => !item.avatar)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={getImageUrl(item.id)}
                          alt={`Gallery image ${item.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Failed to load image:", e);
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                          }}
                        />
                      </div>

                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200 cursor-pointer"
                          title="Delete image"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {item.cover && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-[#cc0000] text-white text-xs px-2 py-1 rounded-full shadow-md">
                            Cover
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                        <div className="text-white text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="opacity-75">Type:</span>
                            <span>{item.mediaType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="opacity-75">Size:</span>
                            <span>{(item.sizeBytes / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {items.filter((item) => !item.avatar).length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    No images in your gallery
                  </p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="mt-4 text-[#cc0000] hover:text-[#a30000] text-sm font-medium"
                  >
                    Upload your first image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarwashMedia;
