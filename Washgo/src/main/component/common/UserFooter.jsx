import React from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from 'prop-types'; // Import prop-types

const Footer = ({ className = "" }) => {
  const location = useLocation();

  // Helper function to determine if a path is active
  // Use exact match for home, startsWith for others if needed
  const isActive = (path, exact = false) => {
      if (exact) {
          return location.pathname === path;
      }
      return location.pathname.startsWith(path);
  };


  // Navigation items definition - Updated path for Map
  const navItems = [
    { path: "/home", icon: "fas fa-home", label: "Home", exact: true }, // Use exact match for home
    { path: "/map", icon: "fas fa-map-marker-alt", label: "Map", exact: true }, // Set path to /map
    { path: "/search", icon: "fas fa-search", label: "Search", exact: false }, // Use startsWith for search?q=...
    { path: "/userInfo", icon: "fas fa-user", label: "Personal", exact: true }, // Use exact match for user info
  ];


  return (
    // Footer container: Fixed at bottom, white bg, top border, shadow, hidden on medium screens and up
    <footer className={`bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-[-2px_0px_5px_rgba(0,0,0,0.05)] ${className}`}>
      {/* Navigation container */}
      <nav className="flex justify-around items-center h-14"> {/* Fixed height */}
        {navItems.map((item) => {
          // Use the isActive helper with the exact flag
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.label}
              to={item.path}
              // Link item styling
              className={`
                 flex flex-col items-center justify-center flex-grow h-full px-2
                 text-xs transition duration-150 ease-in-out
                 ${active
                    ? "text-[#cc0000] font-semibold" // Red color for active tab
                    : "text-gray-500 hover:text-gray-700" // Gray for inactive, darker gray on hover
                 }
              `}
              aria-current={active ? "page" : undefined} // Accessibility
            >
              {/* Icon Styling */}
              <i className={`${item.icon} text-lg mb-0.5`}></i>
              {/* Text Label */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

// Define PropTypes (currently none needed unless className is critical)
Footer.propTypes = {
    className: PropTypes.string,
};

export default Footer;