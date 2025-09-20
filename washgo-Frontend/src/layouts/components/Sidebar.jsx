import React from "react";
import PropTypes from "prop-types"; // Import prop-types

const Sidebar = ({
  Options,
  selectedOption,
  onOptionClick,
  className = "",
}) => {
  return (
    <div
      className={`w-64 h-screen bg-white p-4 border-r border-gray-200 shadow-sm flex-shrink-0 ${className}`}
    >
      {/* Sidebar Title */}
      <h3 className="text-base font-semibold text-gray-500 mb-4 uppercase tracking-wider px-2">
        Actions
      </h3>

      {/* List of options */}
      <ul className="space-y-1.5">
        {Object.entries(Options).map(([key, value]) => {
          const isSelected = selectedOption === key;

          // Special styling for the "Logout" option
          const isLogout = key === "logout";

          return (
            <li
              key={key}
              className={`flex items-center p-3 rounded-md cursor-pointer transition duration-150 ease-in-out group ${
                isLogout
                  ? "border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white"
                  : isSelected
                  ? "bg-[#cc0000] text-white font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => onOptionClick(key)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) =>
                (e.key === "Enter" || e.key === " ") && onOptionClick(key)
              }
            >
              {/* Icon for Logout */}
              {isLogout ? (
                <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i>
              ) : (
                <i
                  className={`fas fa-circle mr-3 w-5 text-center ${
                    isSelected
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                ></i>
              )}
              <span className="text-sm">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Define PropTypes
Sidebar.propTypes = {
  Options: PropTypes.objectOf(PropTypes.string).isRequired, // Expects an object where values are strings (API paths)
  selectedOption: PropTypes.string, // The key of the currently selected option
  onOptionClick: PropTypes.func.isRequired, // Function to call when an option is clicked
  className: PropTypes.string, // Allow custom classes
};

export default Sidebar;
