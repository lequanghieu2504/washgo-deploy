import React from "react";
import PropTypes from "prop-types";
import WashGoLoGo from "@/layouts/components/WashGoLoGo";
import SearchBar from "@/components/common/SearchBar";
import { Link } from "react-router-dom";
import { useShowGlobalFilterState } from "@/hooks/useShowGlobalFilterState";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

const UserHeader = ({ isDesktop = true }) => {
  const { userData, accessToken, isRefreshing } = useTokenRefresh();
  const isLoggedIn = !!(userData || accessToken);

  const { isExpanded } = useShowGlobalFilterState();

  return (
    <>
      <header className="relative flex h-14 items-center justify-between bg-white px-5 py-2 shadow-md ">
        <div
          className={`
            overflow-hidden  text-lg font-semibold text-gray-700
            transition-all duration-500 ease-in-out
            ${isExpanded ? "w-0 opacity-0 pointer-events-none" : "max-w-40"}
          `}
        >
          <WashGoLoGo />
        </div>

        {isDesktop && (
          <div
            className={`
              flex justify-center min-w-0 
              transition-all duration-500 ease-in-out
              ${isExpanded ? "flex-grow" : "w-32 sm:w-36 md:w-48 lg:w-72"}
            `}
          >
            <SearchBar className="w-full h-10 bg-gray-100 rounded-full" />
          </div>
        )}

        <div
          className={`
            overflow-hidden  text-lg font-semibold text-gray-700
            transition-all duration-500 ease-in-out
            ${isExpanded ? "w-0 opacity-0 pointer-events-none" : "max-w-40"}
          `}
        >
          {isLoggedIn ? (
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000] transition duration-150 ease-in-out"
              aria-label="View notifications"
              disabled={isRefreshing}
            >
              <i className="fas fa-bell"></i>
            </button>
          ) : (
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000] transition duration-150 ease-in-out"
              aria-label="Login"
            >
              <Link to="/login" className="text-gray-500">
                <i className="fas fa-sign-in-alt"></i>
              </Link>
            </button>
          )}
        </div>
      </header>
    </>
  );
};

UserHeader.propTypes = {
  isDesktop: PropTypes.bool,
};

export default UserHeader;
