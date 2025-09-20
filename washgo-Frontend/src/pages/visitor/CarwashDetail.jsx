import React, { useState, useEffect, useMemo } from "react";
import { useCarwashProducts } from "@/hooks/useCarwashProduct";
import { useNavigate } from "react-router-dom";
import { useGuestBooking } from "@/hooks/useGuestBooking";
import { useClientBooking } from "@/hooks/useClientBooking";
import { TimePicker } from "@/components/ui/TimePicker";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useQuery } from "@tanstack/react-query";
import { useClientFeedback } from "@/hooks/useClientFeedBack";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CarwashDetail = ({ carwash }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMore, setShowMore] = useState({
    overview: false,
    images: false,
    feedback: false,
  });
  const [bookingNote, setBookingNote] = useState("");
  const [selectedServices, setSelectedServices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [expandedServices, setExpandedServices] = useState({});
  const [phoneNumber, setPhoneNumber] = useState("");

  const [selectedTime, setSelectedTime] = useState(() => {
    const minuteStep = 5;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const currentMinutes = now.getMinutes();
    let roundedMinutes = Math.ceil(currentMinutes / minuteStep) * minuteStep;
    if (roundedMinutes === 60) {
      now.setHours(now.getHours() + 1);
      roundedMinutes = 0;
    }
    now.setMinutes(roundedMinutes);
    let hour = now.getHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    const minute = String(now.getMinutes()).padStart(2, "0");
    return {
      hour: String(hour).padStart(2, "0"),
      minute: minute,
      ampm: ampm,
    };
  });

  const navigate = useNavigate();
  const guestBooking = useGuestBooking();
  const clientBooking = useClientBooking();
  const { userData, accessToken } = useTokenRefresh();
  const userId = userData?.userId;
  const isAuthenticated = !!accessToken;

  const {
    data: apiProducts,
    isLoading: isLoadingServices,
    isError: isErrorServices,
    error: serviceError,
  } = useCarwashProducts(carwash?.id);

  // --- Fetch Carwash Avatar ---
  const { data: avatarData } = useQuery({
    queryKey: ["carwashAvatar", carwash?.id],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/media/users/${carwash.id}/avatar`
      );
      if (res.status === 404) return null; // No avatar set is not an error
      if (!res.ok) throw new Error("Failed to fetch avatar");
      return res.json();
    },
    enabled: !!carwash?.id,
  });

  // --- Fetch Carwash Media ---
  const { data: carwashMedia, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["carwashMedia", carwash?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/media/carwash/${carwash.id}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
    enabled: !!carwash?.id,
  });

  // --- Fetch Carwash Feedback using the correct hook ---
  const { carwashFeedback, isCarwashFeedbackLoading: isLoadingFeedback } =
    useClientFeedback({ carwashId: carwash?.id });

  const avatarUrl = useMemo(
    () => (avatarData?.url ? `${API_URL}${avatarData.url}` : null),
    [avatarData]
  );

  const coverImage = useMemo(
    () => carwashMedia?.find((m) => m.cover),
    [carwashMedia]
  );
  const galleryImages = useMemo(
    () => carwashMedia?.filter((m) => !m.cover) || [],
    [carwashMedia]
  );

  const isValidPhoneNumber = (phone) => /^0[3-9]\d{8}$/.test(phone);
  const canBook =
    totalPrice > 0 && (isAuthenticated || isValidPhoneNumber(phoneNumber));

  const parseTimingToHours = (timingStr) => {
    if (!timingStr || typeof timingStr !== "string") return 0;
    const parts = timingStr.split(":");
    if (parts.length !== 3) return 0;
    const [hours, minutes, seconds] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;
    return hours + minutes / 60 + seconds / 3600;
  };

  const transformApiProduct = (product) => {
    if (!product) return null;
    return {
      productID: product.id,
      productName: product.name,
      productDescription: product.description,
      productPrice: product.pricing.price.toString(),
      productCurrency: product.pricing.currency,
      productExpectTime: parseTimingToHours(product.timing),
    };
  };

  const services = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    const mainProductsApi = apiProducts.filter((p) => p.productParent === null);
    const subProductsApi = apiProducts.filter((p) => p.productParent !== null);
    return mainProductsApi
      .map((mainProductApi) => {
        const mainService = transformApiProduct(mainProductApi);
        if (!mainService) return null;
        mainService.subProducts = subProductsApi
          .filter(
            (subProduct) => subProduct.productParent === mainProductApi.id
          )
          .map(transformApiProduct);
        return mainService;
      })
      .filter((service) => service !== null);
  }, [apiProducts]);

  if (!carwash) return null;

  const overviewText =
    carwash?.description ||
    "Professional car wash service with modern equipment and eco-friendly products. We provide comprehensive cleaning services including exterior wash, interior detailing, and waxing services.";

  const handleServiceToggle = (productID, price) => {
    const isCurrentlySelected = !!selectedServices[productID];
    if (isCurrentlySelected) {
      setSelectedServices((prev) => {
        const newSelected = { ...prev };
        delete newSelected[productID];
        const mainService = services.find((s) => s.productID === productID);
        if (mainService?.subProducts) {
          mainService.subProducts.forEach(
            (sub) => delete newSelected[sub.productID]
          );
        }
        return newSelected;
      });
    } else {
      setSelectedServices((prev) => ({
        ...prev,
        [productID]: parseInt(price),
      }));
      const mainService = services.find((s) => s.productID === productID);
      if (mainService?.subProducts?.length > 0) {
        setExpandedServices((prev) => ({ ...prev, [productID]: true }));
      }
    }
  };

  const handleMainServiceClick = (productID) => {
    setExpandedServices((prev) => ({ ...prev, [productID]: !prev[productID] }));
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPhoneNumber(value);
  };

  const handleBookNow = () => {
    if (!canBook) return;
    const { hour, minute, ampm } = selectedTime;
    let hour24 = parseInt(hour, 10);
    if (ampm === "PM" && hour24 < 12) hour24 += 12;
    if (ampm === "AM" && hour24 === 12) hour24 = 0;
    const timeStr = `${String(hour24).padStart(2, "0")}:${minute}:00`;
    const today = new Date();
    const isoString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}T${timeStr}`;
    const bookingData = {
      notes: bookingNote,
      startTime: isoString,
      productsId: Object.keys(selectedServices),
      carwashId: carwash.id,
    };
    const bookingMutation = isAuthenticated ? clientBooking : guestBooking;
    if (isAuthenticated) bookingData.userId = userId;
    else bookingData.phoneNumber = phoneNumber;
    bookingMutation.mutate(bookingData, {
      onSuccess: (response) =>
        navigate(`/confirm-booking`, { state: response.body || response }),
      onError: (error) => alert(`Booking failed: ${error.message}`),
    });
  };

  useEffect(() => {
    const total = Object.values(selectedServices).reduce(
      (sum, price) => sum + (price || 0),
      0
    );
    setTotalPrice(total);
  }, [selectedServices]);

  const toggleShowMore = (tab) => {
    setShowMore((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
        activeTab === tabName
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full">
      {/* Header with basic info */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-start gap-4">
        {/* Avatar */}
        <img
          src={
            avatarUrl ||
            `https://ui-avatars.com/api/?name=${
              carwash?.carwashName || "C"
            }&background=0D8ABC&color=fff`
          }
          alt="Carwash Avatar"
          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
        />

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {carwash?.carwashName || "Car Wash Name"}
          </h1>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              4.5 (123 reviews)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                📍 {carwash?.location || "123 Main St, Ho Chi Minh City"}
              </p>
              <p className="text-blue-600 text-sm">
                📞 {carwash?.phoneNumber || "+84 123 456 789"}
              </p>
            </div>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${
                    carwash?.latitude || 10.762622
                  },${carwash?.longitude || 106.660172}`,
                  "_blank"
                )
              }
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigator */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-2">
          <TabButton tabName="overview" label="Overview" />
          <TabButton tabName="images" label="Images" />
          <TabButton tabName="feedback" label="Feedback" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === "overview" && (
          <div>
            {isLoadingMedia && <p>Loading...</p>}
            {coverImage && (
              <img
                src={`${API_URL}${coverImage.url}`}
                alt="Carwash Cover"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <p
              className={`text-sm text-gray-700 leading-relaxed ${
                !showMore.overview && "line-clamp-3"
              }`}
            >
              {overviewText}
            </p>
            <button
              onClick={() => toggleShowMore("overview")}
              className="text-blue-600 text-sm font-medium mt-2"
            >
              {showMore.overview ? "Show Less" : "Show More"}
            </button>
          </div>
        )}

        {activeTab === "images" && (
          <div>
            {isLoadingMedia && <p>Loading...</p>}
            <div className="grid grid-cols-3 gap-2">
              {(showMore.images
                ? galleryImages
                : galleryImages.slice(0, 6)
              ).map((img) => (
                <img
                  key={img.id}
                  src={`${API_URL}${img.url}`}
                  alt="Carwash Gallery"
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
            {galleryImages.length > 6 && (
              <button
                onClick={() => toggleShowMore("images")}
                className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
              >
                {showMore.images
                  ? "Show Less"
                  : `Show More (${galleryImages.length - 6} more)`}
              </button>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div>
            {isLoadingFeedback && <p>Loading feedback...</p>}

            {!isLoadingFeedback &&
            (!carwashFeedback || carwashFeedback.length === 0) ? (
              <div className="text-center py-8 px-4">
                <img
                  src="src\assets\images\not-found.png"
                  alt="No feedback yet"
                  className="mx-auto w-48 h-auto mb-4"
                  draggable={false}
                />
                <p className="text-lg font-semibold text-gray-700">
                  No Feedback Yet
                </p>
                <p className="text-sm text-gray-500">
                  Be the first to share your experience with this car wash.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {(showMore.feedback
                    ? carwashFeedback
                    : carwashFeedback?.slice(0, 2)
                  )?.map((fb) => (
                    <div key={fb.id} className="border-b pb-4">
                      <p className="font-medium">{fb.clientUsername}</p>
                      <div className="flex items-center my-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 fill-current ${
                              i < fb.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}
                </div>
                {(carwashFeedback?.length || 0) > 2 && (
                  <button
                    onClick={() => toggleShowMore("feedback")}
                    className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    {showMore.feedback
                      ? "Show Less"
                      : `Show More (${carwashFeedback.length - 2} more)`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Services Selection Section */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-3">Select Services</h3>
        {isLoadingServices && <p>Loading services...</p>}
        {isErrorServices && (
          <p>Error loading services: {serviceError?.message}</p>
        )}
        {!isLoadingServices && !isErrorServices && services.length > 0 && (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.productID}
                className="border border-gray-200 rounded-lg"
              >
                <div className="p-3 flex items-start">
                  <input
                    type="checkbox"
                    checked={!!selectedServices[service.productID]}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleServiceToggle(
                        service.productID,
                        service.productPrice
                      );
                    }}
                    className="w-4 h-4 text-blue-600 rounded mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{service.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {service.productDescription}
                        </p>
                        <p className="text-xs text-gray-500">
                          ⏱️ {service.productExpectTime.toFixed(1)}h
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-blue-600">
                        {parseInt(service.productPrice).toLocaleString()}{" "}
                        {service.productCurrency}
                      </span>
                    </div>
                  </div>
                  {service.subProducts?.length > 0 && (
                    <div
                      className="p-2 cursor-pointer"
                      onClick={() => handleMainServiceClick(service.productID)}
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          expandedServices[service.productID]
                            ? "rotate-180"
                            : ""
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
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
                {expandedServices[service.productID] &&
                  service.subProducts?.length > 0 && (
                    <div className="mt-0 pt-2 pb-3 px-3 border-t bg-gray-50">
                      <p className="text-sm font-medium mb-2">Add-ons:</p>
                      <div className="space-y-2 pl-5">
                        {service.subProducts.map((sub) => (
                          <label
                            key={sub.productID}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={!!selectedServices[sub.productID]}
                              onChange={() =>
                                handleServiceToggle(
                                  sub.productID,
                                  sub.productPrice
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="text-sm font-medium">
                                    {sub.productName}
                                  </h5>
                                  <p className="text-xs text-gray-600">
                                    {sub.productDescription}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ⏱️ {sub.productExpectTime.toFixed(1)}h
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">
                                  +{parseInt(sub.productPrice).toLocaleString()}{" "}
                                  {sub.productCurrency}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">
              Selected services ({Object.keys(selectedServices).length})
            </span>
            <span className="text-xl font-bold">
              {totalPrice.toLocaleString()} VND
            </span>
          </div>
          {!isAuthenticated && totalPrice > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="0xxxxxxxxx"
                className={`w-full px-3 py-2 border rounded-lg ${
                  phoneNumber && !isValidPhoneNumber(phoneNumber)
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
            </div>
          )}
          {totalPrice > 0 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Arrival Time
                </label>
                <TimePicker
                  value={selectedTime}
                  onChange={setSelectedTime}
                  minuteStep={5}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="bookingNote"
                  className="block text-sm font-medium mb-2"
                >
                  Booking Note (optional)
                </label>
                <textarea
                  id="bookingNote"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., I will be there soon."
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                />
              </div>
            </>
          )}
          <button
            disabled={!canBook}
            className={`w-full py-3 rounded-lg font-semibold ${
              canBook
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleBookNow}
          >
            {totalPrice === 0
              ? "Select services to book"
              : !isAuthenticated && !isValidPhoneNumber(phoneNumber)
              ? "Enter phone number to continue"
              : `Book Now - ${totalPrice.toLocaleString()} VND`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarwashDetail;
