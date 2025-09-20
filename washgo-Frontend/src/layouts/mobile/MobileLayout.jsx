import React from "react";
import UserFooter from "@/layouts/components/UserFooter";
import UserHeader from "@/layouts/components/UserHeader";
import { Outlet, useLocation } from "react-router-dom";

const HEADER_HEIGHT = 56; // px
const FOOTER_HEIGHT = 56; // px

const MobileLayout = () => {
  const location = useLocation();

  // Check if current route is the map page
  const isMapPage =
    location.pathname === "/map" || location.pathname.includes("/map");

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 w-full z-90"
        style={{ height: HEADER_HEIGHT }}
      >
        <UserHeader />
      </div>

      {/* Main Content - Different height handling for map vs other pages */}
      <div
        className={`pt-[56px] pb-[56px] ${
          isMapPage ? "h-screen" : "min-h-screen"
        }`}
      >
        <Outlet />
      </div>

      {/* Fixed Footer */}
      <div
        className="fixed bottom-0 left-0 w-full z-90"
        style={{ height: FOOTER_HEIGHT }}
      >
        <UserFooter />
      </div>
    </div>
  );
};

export default MobileLayout;
