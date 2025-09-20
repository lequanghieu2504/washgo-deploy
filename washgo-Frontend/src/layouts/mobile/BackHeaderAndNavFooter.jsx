import React from "react";
import { Outlet } from "react-router-dom";
import BackHeaderWithTitle from "@/layouts/components/BackHeaderWithTitle";
import Footer from "@/layouts/components/UserFooter";

const BackHeaderAndNavFooter = ({ title, onBackClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeaderWithTitle title={title} onBackClick={onBackClick} />

      <main className="pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BackHeaderAndNavFooter;
