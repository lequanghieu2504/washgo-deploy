import React from "react";
import PropTypes from 'prop-types'; // Import prop-types

const Sidebar = ({ Options, selectedOption, onOptionClick, className = "" }) => {
  return (
    // Sidebar container: Defined width, full height, padding, background, border, shadow
    <div className={`w-64 h-screen bg-white p-4 border-r border-gray-200 shadow-sm flex-shrink-0 ${className}`}>
       {/* Sidebar Title */}
      <h3 className="text-base font-semibold text-gray-500 mb-4 uppercase tracking-wider px-2"> {/* Adjusted title style */}
         Actions
      </h3>
      {/* List of options */}
      <ul className="space-y-1.5"> {/* Adjusted spacing */}
        {Object.entries(Options).map(([key, value]) => { // Value is API path, not used directly here
           const isSelected = selectedOption === key;
           return (
              <li
                key={key}
                // List item styling: padding, rounding, cursor, transition
                // Conditional styling for selected vs non-selected items
                className={`
                    flex items-center p-3 rounded-md cursor-pointer 
                    transition duration-150 ease-in-out group 
                    ${isSelected
                        ? "bg-[#cc0000] text-white font-semibold shadow-sm" // Red background for selected
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800" // Subtle hover for others
                    }`
                }
                onClick={() => onOptionClick(key)}
                role="button" // Semantics
                tabIndex={0} // Make focusable
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onOptionClick(key)} // Keyboard interaction
              >
                {/* Optional: Add icons based on key */}
                {/* <i className={`fas fa-... mr-3 w-5 text-center ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}></i> */}
                <span className="text-sm">
                    {/* Capitalize the key for display */}
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