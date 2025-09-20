import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SpecialOffer = () => {
  const navigate = useNavigate();
  const [useMockData, setUseMockData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data for special offers
  const mockOffers = [
    {
      id: 1,
      title: "Premium Wash Package",
      description: "Complete car wash with wax and interior cleaning",
      originalPrice: 50,
      salePrice: 35,
      discount: 30,
      validUntil: "2024-02-29",
      image:
        "https://s3.envato.com/files/251995367/01_carwash_design_preview/01_carwash_design.jpg",
    },
    {
      id: 2,
      title: "Quick Wash Special",
      description: "Fast exterior wash and dry",
      originalPrice: 25,
      salePrice: 18,
      discount: 28,
      validUntil: "2024-02-15",
      image:
        "https://s3.envato.com/files/251995367/01_carwash_design_preview/03_carwash_design.jpg",
    },
    {
      id: 3,
      title: "Monthly Subscription",
      description: "Unlimited washes for one month",
      originalPrice: 120,
      salePrice: 89,
      discount: 26,
      validUntil: "2024-03-31",
      image:
        "https://s3.envato.com/files/251995367/01_carwash_design_preview/02_carwash_design.jpg",
    },
    {
      id: 4,
      title: "Deluxe Detail Package",
      description: "Complete detailing service inside and out",
      originalPrice: 150,
      salePrice: 99,
      discount: 34,
      validUntil: "2024-02-20",
      image:
        "https://s3.envato.com/files/251995367/01_carwash_design_preview/04_face_timeline.jpg",
    },
    {
      id: 5,
      title: "Express Wash",
      description: "Quick 15-minute wash",
      originalPrice: 15,
      salePrice: 10,
      discount: 33,
      validUntil: "2024-02-25",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 6,
      title: "Family Package",
      description: "Wash up to 3 cars",
      originalPrice: 80,
      salePrice: 60,
      discount: 25,
      validUntil: "2024-03-10",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 7,
      title: "Weekend Special",
      description: "Saturday and Sunday discount",
      originalPrice: 40,
      salePrice: 28,
      discount: 30,
      validUntil: "2024-02-18",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 8,
      title: "Student Discount",
      description: "Special rate for students with ID",
      originalPrice: 30,
      salePrice: 20,
      discount: 33,
      validUntil: "2024-04-30",
      image: "https://via.placeholder.com/300x200",
    },
  ];

  const offers = useMockData ? mockOffers : [];

  // Pagination logic
  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOffers = offers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const NoOffersMessage = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          No Special Offers Available
        </h3>
        <p className="text-gray-600 mb-6">
          We don't have any special offers yet, but we will have some amazing
          deals soon! Stay tuned for exciting car wash packages and discounts.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );

  const OfferCard = ({ offer }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={offer.image}
        alt={offer.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
            {offer.discount}% OFF
          </span>
        </div>
        <p className="text-gray-600 mb-4">{offer.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">
              ${offer.salePrice}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${offer.originalPrice}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Valid until: {new Date(offer.validUntil).toLocaleDateString()}
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-2 rounded-lg ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Special Offers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals on our car wash services. Save money while
            keeping your car spotless!
          </p>
        </div>

        {/* Mock Data Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <label className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Use Mock Data:
              </span>
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Content */}
        {offers.length === 0 ? (
          <NoOffersMessage />
        ) : (
          <>
            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialOffer;
