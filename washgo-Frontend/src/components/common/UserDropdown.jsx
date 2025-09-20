import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types"; // Import prop-types
import { useTranslation } from "react-i18next"; // Import translation hook
import Switch from "../ui/Switch"; // Import the Switch component

const UserDropdown = ({ onAction }) => {
  const { t, i18n } = useTranslation(); // Initialize translation hook
  const accessToken = localStorage.getItem("accessToken");
  // Wrapper function to handle action and then potentially close dropdown
  const handleLinkClick = () => {
    if (onAction) {
      onAction(); // Call the passed function (e.g., to close the dropdown)
    }
  };

  // Function to switch language (dropdown remains open)
  const handleLanguageChange = () => {
    const newLanguage = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLanguage); // Toggle language
  };

  return (
    <div className="bg-white shadow-lg rounded-md w-48 border border-gray-200 py-1">
      <ul
        className="text-sm text-gray-700"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        {/* Profile Option */}
        <li role="none">
          <Link
            to={"/userInfo"}
            className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
            onClick={handleLinkClick}
            role="menuitem"
            tabIndex="-1"
          >
            <i className="fas fa-user w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
            <span>{t("profile")}</span>
          </Link>
        </li>

        {/* Setting Option */}
        <li role="none">
          <button
            type="button"
            className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
            onClick={handleLinkClick}
            role="menuitem"
            tabIndex="-1"
          >
            <i className="fas fa-cog w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
            <span>{t("setting")}</span>
          </button>
        </li>

        {/* Separator */}
        <li role="separator">
          <hr className="my-1 border-gray-100" />
        </li>

        {/* Language Switcher */}
        <li role="none">
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500 mb-1">{t("language")}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">English</span>
              <Switch
                checked={i18n.language === "vi"}
                onChange={handleLanguageChange}
                className="ml-2"
              />
              <span className="text-sm text-gray-700">Tiếng Việt</span>
            </div>
          </div>
        </li>

        {/* Separator */}
        <li role="separator">
          <hr className="my-1 border-gray-100" />
        </li>

        {/* Login/Logout Option */}
        <li role="none">
          {accessToken ? (
            <Link
              to={"/logout"}
              className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
              onClick={handleLinkClick}
              role="menuitem"
              tabIndex="-1"
            >
              <i className="fas fa-sign-out-alt w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
              <span>{t("logout.logout")}</span>
            </Link>
          ) : (
            <Link
              to={"/login"}
              className="group flex items-center w-full px-4 py-2 hover:bg-red-50 hover:text-[#cc0000] transition duration-150 ease-in-out"
              onClick={handleLinkClick}
              role="menuitem"
              tabIndex="-1"
            >
              <i className="fas fa-sign-in-alt w-5 text-center text-gray-400 mr-3 group-hover:text-[#cc0000]"></i>
              <span>{t("login.login")}</span>
            </Link>
          )}
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
