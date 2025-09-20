import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";

// --- Helper function to create a cropped image ---
const createCroppedImage = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

const ImageUploadPreview = ({
  isOpen,
  onClose,
  file,
  onUpload,
  isUploading,
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Create a URL for the file to prevent memory leaks
  useEffect(() => {
    let objectUrl = null;
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setImageSrc(objectUrl);
    }
    // Cleanup function to revoke the object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setImageSrc(null);
      }
    };
  }, [file]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      // 1. Crop the image
      const croppedImageBlob = await createCroppedImage(
        imageSrc,
        croppedAreaPixels
      );

      // 2. Check size and compress if needed
      const options = {
        maxSizeMB: 1, // Max size 1MB
        maxWidthOrHeight: 800, // Resize to 800px on the longest side
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(
        new File([croppedImageBlob], file.name, { type: "image/jpeg" }),
        options
      );

      // 3. Call the upload function from the hook
      onUpload(compressedFile);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error processing image:", error);
      // Optionally, show an error message to the user
    }
  };

  if (!isOpen || !file) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full h-80 bg-gray-200">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <FaMinus className="text-gray-500" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <FaPlus className="text-gray-500" />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-blue-300 flex items-center"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPreview;
