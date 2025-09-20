import React from "react";
import { Outlet } from "react-router-dom";
import BackHeaderAndNavFooter from "@/layouts/components/BackHeaderAndNavFooter";

const HeaderOnlyLayout = ({ title, onBackClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeaderAndNavFooter title={title} onBackClick={onBackClick} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
