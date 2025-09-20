import React, { useEffect, useState } from "react";

import Table from "../common/Table";
import Sidebar from "../common/Sidebar";
import LazySection from "../common/LazySection";
import TableSkeleton from "../skeleton/TableSkeleton";
import AddComponent from "../common/AddComponent";
const AdminHomePage = () => {
  const [tableData, setTableData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const apiOptions = {
    register: "register",
    user: "user",
    booking: "bookings",
    product: "products",
    productMaster: "product-master",
    carwashes: "carwashes",
    chat: "chat",
    pricing: "pricing",
    schedules: "schedules",
  };

  const handleOptionClick = (key) => {
    setPopupData(null);
    setSelectedOption(key);
    setTableData(apiOptions[key]);
  };

  const handleRowClick = (data) => {
    setPopupData(data);
  };

  const handleExpand = (expandedData) => {
    setTableData(expandedData);
    setPopupData(null);
  };

  const handleClose = () => {
    setPopupData(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        Options={apiOptions}
        selectedOption={selectedOption}
        onOptionClick={handleOptionClick}
      />

      <div className="flex-1 p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <LazySection
          className="mt-6"
          isLoading={isLoading}
          skeleton={<TableSkeleton />}
        >
          {selectedOption == "info" ? (
            <FieldEditor
              data={carwashInfo}
              onExpand={handleExpand}
              onClose={handleClose}
              selectedOption={selectedOption}
            />
          ) : (
            <>
              <AddComponent selectedOption={selectedOption} />
              <Table
                data={Array.isArray(tableData) ? tableData : [tableData]}
                onRowClick={handleRowClick}
              />
            </>
          )}
        </LazySection>

        {popupData && (
          <PopupContainer title="Details" onClose={handleClose}>
            <FieldEditor
              data={popupData}
              onExpand={handleExpand}
              onClose={handleClose}
              selectedOption={selectedOption}
            />
          </PopupContainer>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;
