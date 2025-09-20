import React from "react";
import UserFooter from "../common/UserFooter";
import UserHeader from "../common/UserHeader";

const MobileLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header>
        <UserHeader isDesktop={false} />
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* UserFooter */}
      <UserFooter />
    </div>
  );
};

export default MobileLayout;
