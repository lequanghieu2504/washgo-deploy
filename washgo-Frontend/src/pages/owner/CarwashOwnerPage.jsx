import React, { useState, useEffect } from "react";
import Sidebar from "@/layouts/components/Sidebar";
import Table from "@/components/common/Table";
import LazySection from "@/components/common/LazySection";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import FieldEditor from "@/components/common/FieldEditor";
import PopupContainer from "@/components/common/PopupContainer";
import AddComponent from "@/components/common/AddComponent";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
// import { Chat } from "@/components/common/Chat";
import ChatSkeleton from "@/components/skeletons/ChatSkeleton";
import { useUserStore } from "@/hooks/useUserStore";

export default function CarwashOwnerPage() {
  const [showChat, setShowChat] = useState(false);
  const [carwashInfo, setCarwashInfo] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [products, setProducts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [booking, setBooking] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedOption, setSelectedOption] = useState("info");
  const navigate = useNavigate();

  const { user, loading } = useUserStore();

  const apiOptions = {
    info: carwashInfo,
    products,
    schedules,
    pricing,
    booking,
    logout: "logout",
  };

  const contextData = {
    carwashes: carwashInfo,
    products,
    schedules,
    pricing,
    booking,
  };

  // Loading Section

  useEffect(() => {
    if (!user || loading) return;
    CarwashService.retrieveAll()
      .then((carwashList) => {
        carwashList.filter((carwash) => {
          if (carwash.username === user.sub) {
            setCarwashInfo(carwash);
            CarwashService.retrieveProducts(carwash.id)
              .then((productList) => {
                setProducts(productList);
                const pricingArr = productList
                  .map((product) => product.pricing)
                  .filter((pricing) => pricing);
                setPricing(pricingArr);
                setSchedules(
                  productList.flatMap((product) => product.schedules)
                );
              })
              .catch((error) =>
                console.error("Error retrieving products:", error)
              );
          }
        });
      })
      .catch((error) => console.error("Error retrieving carwash info:", error))
      .finally(setLoading(false));
  }, [loading, user, trigger]);

  useEffect(() => {
    setTableData(apiOptions[selectedOption]);
  }, [carwashInfo, products, pricing, schedules, trigger]);

  // --- Handlers ---

  const handleOptionClick = (key) => {
    if (key === "logout") {
      navigate("/logout");
      return;
    }
    setPopupData(null);
    setSelectedOption(key);
    setTableData(apiOptions[key]);
  };

  const handleRowClick = (data) => {
    setPopupData(data);
  };

  const handleExpand = (expandedData) => {
    setTableData(expandedData);
    setPopupData(null);
  };

  const handleClose = (change = false) => {
    setPopupData(null);
    if (change) {
      setTrigger((prev) => !prev);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setSelectedImage(file);

    // Create FormData to send file
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await CarwashService.updateProfileImage(carwashInfo.id, formData);
      if (response.ok) {
        setTrigger(prev => !prev); // Refresh carwash info
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Button
        className="absolute top-4 right-4"
        onClick={() => {
          setShowChat((prev) => !prev);
        }}
      >
        {showChat ? "Close Chat" : "Open Chat"}
      </Button>
      <Sidebar
        Options={apiOptions}
        selectedOption={selectedOption}
        onOptionClick={handleOptionClick}
      />

      <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end">
        <button
          className="mb-2 shadow-lg rounded-full w-16 h-16 flex items-center justify-center bg-[#cc0000] text-white hover:bg-[#a30000] transition focus:outline-none"
          onClick={() => setShowChat((prev) => !prev)}
          aria-label={showChat ? "Close Chat" : "Open Chat"}
        >
          {/* Temporary chat bubble SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-3.582 7-8 7a8.96 8.96 0 01-4-.93L3 21l1.07-3.21A7.963 7.963 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z"
            />
          </svg>
        </button>
        {showChat && (
          <div className="mt-2">
            <Chat currentUser={user.sub} />
          </div>
        )}
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Carwash Owner Dashboard</h1>
        
        {selectedOption === 'info' && (
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-32 h-32 relative">
                <img
                  src={imagePreview || carwashInfo?.imageUrl || '/default-carwash.png'}
                  alt="Carwash profile"
                  className="w-full h-full object-cover rounded-lg shadow"
                />
                <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600 hover:text-gray-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
            </div>
          </div>
        )}

        <LazySection
          className="mt-6"
          isLoading={isLoading}
          skeleton={<TableSkeleton />}
        >
          {selectedOption == "info" ? (
            <FieldEditor
              data={carwashInfo}
              onExpand={handleExpand}
              onClose={handleClose}
              selectedOption={selectedOption}
            />
          ) : (
            <>
              <AddComponent
                selectedOption={selectedOption}
                contextData={contextData}
                onClose={handleClose}
              />
              <Table
                data={Array.isArray(tableData) ? tableData : [tableData]}
                onRowClick={handleRowClick}
              />
            </>
          )}
        </LazySection>

        {popupData && (
          <PopupContainer title="Details" onClose={handleClose}>
            <FieldEditor
              data={popupData}
              onExpand={handleExpand}
              onClose={handleClose}
              selectedOption={selectedOption}
              contextData={contextData}
            />
          </PopupContainer>
        )}
      </div>
    </div>
  );
}
