import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import the actual CarwashMap component
import CarwashMap from "../common/CarwashMap"; // <-- Make sure this import is uncommented

function Home() {
  const [carwashes, setCarwashes] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [username, setUsername] = useState("User"); // Placeholder username
  const navigate = useNavigate();

  // Fetch actual username - replace with your auth logic
  useEffect(() => {
    // Example: const name = getUserFromLocalStorage() || 'User';
    // setUsername(name);
  }, []);

  // Add dummy coordinates to dummy data for map functionality
  const generateDummyData = () => {
    const dummyData = Array.from({ length: 10 }, (_, index) => ({
      // Reduced number for demo
      id: index + 1,
      carwash_name: `Shiny Wash ${index + 1}`,
      location: `Location ${index + 1}`,
      description: `Description for Carwash ${index + 1}`,
      average_rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Ratings between 3.5-5.0
      rating_count: Math.floor(Math.random() * 100) + 10, // 10+ ratings
      user_id: `User${index + 1}`,
      image_url: `https://via.placeholder.com/200x150/cccccc/808080?text=Wash+${
        index + 1
      }`, // Placeholder images
      latitude: `${10.76 + (Math.random() - 0.5) * 0.1}`, // Example around HCMC
      longitude: `${106.66 + (Math.random() - 0.5) * 0.1}`, // Example around HCMC
    }));
    setCarwashes(dummyData);
  };

  useEffect(() => {
    generateDummyData();
    // Replace with actual data fetching:
    // getData();
  }, []);

  // Actual data fetching function (keep if needed)
  /*
  const getData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    // ... (rest of the getData function)
  };
  */

  const navigateToSearch = (param) => {
    navigate(`/search?q=${param}`);
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    // Use lighter gray background
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Main content wrapper with padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner - Professional red gradient style */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#cc0000] to-[#a30000] text-white rounded-lg p-6 relative shadow-lg overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-semibold">
                How's {username}'s bike?
              </h2>
              <div className="mt-2">
                <h3 className="text-3xl font-bold">Special Offer!</h3>
                <p className="text-4xl font-extrabold mt-1">50% OFF</p>
                <p className="text-sm mt-1 opacity-90">On Your First Service</p>
                <button className="mt-4 bg-white text-[#cc0000] font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition duration-200">
                  Book Now
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 opacity-20 z-0">
              {/* Placeholder graphic */}
              <svg
                className="w-48 h-48"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l.293.293a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 10.586l-3.293-3.293a1 1 0 000-1.414z"></path>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Map Toggle Button and Map Display */}
        <div className="mb-6">
          <button
            onClick={toggleMap}
            className="mb-4 inline-flex items-center px-4 py-2 bg-[#cc0000] text-white font-medium rounded-md shadow-sm hover:bg-[#a30000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cc0000] transition duration-150 ease-in-out"
          >
            <i
              className={`fas ${showMap ? "fa-map-marked-alt" : "fa-map"} mr-2`}
            ></i>
            {showMap ? "Hide Map" : "Show Nearby Map"}
          </button>
          {/* Conditionally render the ACTUAL CarwashMap component */}
          {/* Ensure the CarwashMap component handles the passed 'carwashes' prop if needed */}
          {showMap && <CarwashMap /* carwashes={carwashes} */ />}
        </div>

        {/* Nearby Stations Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Nearby Stations
            </h3>
            <button
              onClick={() => navigateToSearch("nearby")}
              className="text-sm font-medium text-[#cc0000] hover:text-[#a30000] transition duration-150"
            >
              See All
            </button>
          </div>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {carwashes.slice(0, 8).map((carwash) => (
                <div
                  key={carwash.id}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 w-60 flex-shrink-0 snap-start hover:shadow-md transition duration-200 cursor-pointer"
                  onClick={() => navigate(`/carwash/${carwash.id}`)}
                >
                  <img
                    src={carwash.image_url || "https://via.placeholder.com/100"}
                    alt={carwash.carwash_name}
                    className="w-full h-32 rounded-lg object-cover mb-3 bg-gray-200"
                  />
                  <h4 className="text-md font-semibold text-gray-900 truncate">
                    {carwash.carwash_name}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {carwash.location}
                  </p>
                  <div className="flex items-center mt-1">
                    <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                    <span className="text-sm font-medium text-gray-700">
                      {carwash.average_rating}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({carwash.rating_count} reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Rated Section (similar styling) */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Best Rated Near You
            </h3>
            <button
              onClick={() => navigateToSearch("best rated")}
              className="text-sm font-medium text-[#cc0000] hover:text-[#a30000] transition duration-150"
            >
              See All
            </button>
          </div>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {[...carwashes]
                .sort((a, b) => b.average_rating - a.average_rating)
                .slice(0, 8)
                .map((carwash) => (
                  <div
                    key={carwash.id}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 w-60 flex-shrink-0 snap-start hover:shadow-md transition duration-200 cursor-pointer"
                    onClick={() => navigate(`/carwash/${carwash.id}`)}
                  >
                    <img
                      src={
                        carwash.image_url || "https://via.placeholder.com/100"
                      }
                      alt={carwash.carwash_name}
                      className="w-full h-32 rounded-lg object-cover mb-3 bg-gray-200"
                    />
                    <h4 className="text-md font-semibold text-gray-900 truncate">
                      {carwash.carwash_name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {carwash.location}
                    </p>
                    <div className="flex items-center mt-1">
                      <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                      <span className="text-sm font-medium text-gray-700">
                        {carwash.average_rating}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({carwash.rating_count} reviews)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
