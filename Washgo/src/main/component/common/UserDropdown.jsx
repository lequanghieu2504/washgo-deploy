import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types'; // Import prop-types

// Assuming onAction is a function passed down to close the dropdown,
// e.g., onClick={closeDropdown}
const UserDropdown = ({ onAction }) => {

    // Wrapper function to handle action and then potentially close dropdown
    const handleLinkClick = () => {
        if (onAction) {
            onAction(); // Call the passed function (e.g., to close the dropdown)
        }
    };

  return (
    // Removed absolute positioning - should be handled by the parent rendering this dropdown
    // Added border, adjusted width and rounding for consistency
    <div className="bg-white shadow-lg rounded-md w-48 border border-gray-200 py-1">
      {/* {console.log("UserDropdown Rendered")} */}
      {/* Use role="menu" and related aria attributes for accessibility */}
      <ul className="text-sm text-gray-700" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"> {/* Assuming parent button has id="user-menu-button" */}

        {/* Profile Option */}
        <li role="none"> {/* List item acts as presentation container */}
          <Link
            to={"/userinfo"}
             // Consistent styling for menu items, added group for icon hover
            className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
            onClick={handleLinkClick} // Call handler to close dropdown
            role="menuitem" // Accessibility role
            tabIndex="-1" // Accessibility
          >
            {/* Icon styling - slightly lighter, changes color on group hover */}
            <i className="fas fa-user w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
            <span>Profile</span>
          </Link>
        </li>

        {/* Setting Option - Assuming this is a future feature or opens a settings modal */}
        <li role="none">
           {/* Use a button if it triggers an action, Link if it navigates */}
           <button
               type="button"
               className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
               onClick={handleLinkClick} // Assuming settings might also close dropdown
               role="menuitem"
               tabIndex="-1"
            >
            <i className="fas fa-cog w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
            <span>Setting</span>
          </button>
        </li>

        {/* Separator (Optional) */}
        <li role="separator"><hr className="my-1 border-gray-100" /></li>


        {/* Logout Option */}
        <li role="none">
          <Link
            to={"/logout"}
            className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
            onClick={handleLinkClick}
            role="menuitem"
            tabIndex="-1"
          >
            <i className="fas fa-sign-out-alt w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
            <span>Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

// Define PropTypes
UserDropdown.propTypes = {
  onAction: PropTypes.func, // Optional function to call after an action (e.g., close dropdown)
};


export default UserDropdown;