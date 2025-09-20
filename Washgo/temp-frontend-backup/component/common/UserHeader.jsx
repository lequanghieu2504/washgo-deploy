import React, { useState, useEffect, useRef } from "react"; // Added useEffect, useRef
import PropTypes from 'prop-types'; // Import prop-types
import UserDropdown from "./UserDropdown"; // Assumed styled
import WashGoLoGo from "./WashGoLoGo";   // Assumed styled
import SearchBar from "./SearchBar";     // Assumed styled

const UserHeader = ({ isDesktop }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown itself
  const profileButtonRef = useRef(null); // Ref for the profile button

  // Toggle dropdown visibility
  const handleToggleUserDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown AND outside the profile button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    };

    // Add listener if dropdown is visible
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Clean up listener if dropdown is hidden
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]); // Re-run effect when dropdownVisible changes


  return (
    <>
      {/* Header container: Adjusted padding, shadow, added bottom border */}
      <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
        {/* Left Section: Logo */}
        <div className="flex-shrink-0">
            <WashGoLoGo />
        </div>


        {/* Mid Section: Search Bar (conditionally rendered) */}
        {/* Added flex-grow and max-width for better layout */}
        {isDesktop && (
            <div className="flex-grow flex justify-center px-4">
                <SearchBar className="w-full max-w-lg" /> {/* Control width here */}
            </div>
        )}

        {/* Right Section: Notifications and Profile */}
        {/* Increased spacing */}
        <div className="relative flex items-center space-x-4 flex-shrink-0">
          {/* Notification Button */}
          <button
             className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000] transition duration-150 ease-in-out"
             aria-label="View notifications" // Accessibility
           >
            <i className="fas fa-bell"></i>
            {/* Optional: Notification Badge */}
            {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span> */}
          </button>

          {/* Profile Button & Dropdown Container */}
          <div className="relative">
             <button
                ref={profileButtonRef} // Attach ref to the button
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000] transition duration-150 ease-in-out"
                onClick={handleToggleUserDropdown}
                aria-haspopup="true" // Accessibility
                aria-expanded={dropdownVisible} // Accessibility
                aria-label="User menu" // Accessibility
             >
                {/* Changed icon from user-tie */}
                <i className="fas fa-user"></i>
             </button>

             {/* User Dropdown (conditionally rendered) */}
             {/* Positioned absolutely relative to the parent div */}
             {dropdownVisible && (
                <div
                    ref={dropdownRef} // Attach ref to dropdown container
                    className="absolute top-full right-0 mt-2 z-50 origin-top-right" // Position below button
                    // Optional: Add transition classes
                    // transition enter="transition ease-out duration-100"
                    // enterFrom="transform opacity-0 scale-95"
                    // enterTo="transform opacity-100 scale-100"
                    // leave="transition ease-in duration-75"
                    // leaveFrom="transform opacity-100 scale-100"
                    // leaveTo="transform opacity-0 scale-95"
                >
                    {/* Pass function to close dropdown when an item is clicked */}
                    <UserDropdown onAction={() => setDropdownVisible(false)} />
                </div>
             )}
          </div> {/* End relative container for profile button/dropdown */}

        </div>
      </header>
    </>
  );
};

// Define PropTypes
UserHeader.propTypes = {
  isDesktop: PropTypes.bool, // Optional: Whether to show desktop elements like search bar
};

export default UserHeader;