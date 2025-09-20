import React, { useState, useEffect } from "react"; // Added React import
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types'; // Import prop-types

const SearchBar = ({ className = "" }) => { // Added className prop
  const [searchParam, setSearchParam] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedParam = searchParam.trim(); // Trim whitespace
    if (trimmedParam) {
      // Encode the query parameter for safety in URLs
      navigate(`/search?q=${encodeURIComponent(trimmedParam)}`);
    }
  };

  // Clear search input when navigating away from the search page
  useEffect(() => {
    if (!location.pathname.startsWith("/search")) {
      // Only clear if the search param actually matches the current URL query
      // This prevents clearing if the user manually types something different
      // after navigating away from /search but before navigating elsewhere.
      const currentQuery = new URLSearchParams(location.search).get("q");
      if(searchParam === currentQuery || !currentQuery) {
         setSearchParam("");
      }
    } else {
      // If navigating *to* the search page, populate the bar from the URL
      const currentQuery = new URLSearchParams(location.search).get("q");
      if(currentQuery && currentQuery !== searchParam) {
         setSearchParam(currentQuery);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]); // Depend on pathname and search

  // Function to clear the search input
  const handleClearSearch = () => {
    setSearchParam("");
    // Optionally navigate back or clear search results depending on desired UX
    // navigate('/some-default-page'); or navigate('/search'); to clear results
  };


  return (
    // Outer container - adjust width/margin as needed for placement
    // Added focus-within styles for visual feedback
    <div
       className={`
          flex items-center bg-gray-100 rounded-full 
          border border-transparent 
          focus-within:bg-white focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-[#cc0000] 
          transition duration-150 ease-in-out
          ${className} 
       `}
    >
      {/* Form takes full width within the container */}
      <form onSubmit={handleSubmit} className="flex items-center w-full px-4 py-1.5">
        {/* Search Icon Button */}
        <button
           type="submit"
           className="text-gray-500 hover:text-[#cc0000] focus:outline-none pr-2" // Added padding-right
           aria-label="Submit search" // Accessibility
        >
          <i className="fas fa-search"></i>
        </button>
        {/* Input Field */}
        <input
          type="text"
          id="standalone-search" // Unique ID if needed
          placeholder="Search anything..."
          // Transparent bg, no outline (focus handled by parent div)
          className="bg-transparent outline-none text-sm text-gray-800 w-full placeholder-gray-500"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          // Removed 'required' as user might want to submit empty to clear/reset
        />
        {/* Clear Button (appears when text is present) */}
        {searchParam && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-gray-400 hover:text-gray-600 focus:outline-none pl-2" // Added padding-left
            aria-label="Clear search" // Accessibility
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </form>
    </div>
  );
};

// Define PropTypes
SearchBar.propTypes = {
  className: PropTypes.string, // Allow passing custom classes for positioning/sizing
};


export default SearchBar;