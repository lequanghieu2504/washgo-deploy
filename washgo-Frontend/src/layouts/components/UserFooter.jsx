import { useShowGlobalFilterState } from "@/hooks/useShowGlobalFilterState";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

const Footer = ({ className = "" }) => {
  const location = useLocation();
  const { closeAll } = useShowGlobalFilterState();
  const { userData: userInfo } = useTokenRefresh();

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = userInfo
    ? [
        { path: "/", icon: "fas fa-home", label: "Home", exact: true },
        {
          path: "/map",
          icon: "fas fa-map-marker-alt",
          label: "Map",
          exact: true,
        },
        {
          path: "/special-offers",
          icon: "fas fa-tags",
          label: "Offers",
          exact: true,
        },
        {
          path: "/personal",
          icon: "fas fa-user",
          label: "Personal",
          exact: true,
        },
      ]
    : [
        { path: "/", icon: "fas fa-home", label: "Home", exact: true },
        {
          path: "/map",
          icon: "fas fa-map-marker-alt",
          label: "Map",
          exact: true,
        },
        {
          path: "/login",
          icon: "fas fa-sign-in-alt",
          label: "Login",
          exact: true,
        },
      ];

  return (
    // Footer container: No fixed positioning, just a normal block
    <footer
      className={`bg-white border-t border-gray-200 md:hidden shadow-[-2px_0px_5px_rgba(0,0,0,0.05)] ${className}`}
    >
      <nav className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={closeAll}
              className={`
                 flex flex-col items-center justify-center flex-grow h-full px-2
                 text-xs transition duration-150 ease-in-out
                 ${
                   active
                     ? "text-[#cc0000] font-semibold"
                     : "text-gray-500 hover:text-gray-700"
                 }
              `}
              aria-current={active ? "page" : undefined}
            >
              <i className={`${item.icon} text-lg mb-0.5`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
