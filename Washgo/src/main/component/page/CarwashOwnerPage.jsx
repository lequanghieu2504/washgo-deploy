import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Table from "../common/Table";
import { useAuth } from "../../hooks/useAuth";
import LazySection from "../common/LazySection";
import TableSkeleton from "../skeleton/TableSkeleton";
import FieldEditor from "../common/FieldEditor";
import PopupContainer from "../common/PopupContainer";
import { CarwashService } from "@/entities/service/";
import AddComponent from "../common/AddComponent";

export default function CarwashOwnerPage() {
  const [carwashInfo, setCarwashInfo] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [products, setProducts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [booking, setBooking] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(true);

  const [selectedOption, setSelectedOption] = useState("info");

  const { user, loading } = useAuth();

  const apiOptions = {
    info: carwashInfo,
    products,
    schedules,
    pricing,
    booking,
  };

  const contextData = {
    carwashes: carwashInfo,
    products,
    schedules,
    pricing,
    booking,
  };

  // Loading Section

  useEffect(() => {
    if (!user || loading) return;
    CarwashService.retrieveAll()
      .then((carwashList) => {
        carwashList.filter((carwash) => {
          if (carwash.username === user.sub) {
            setCarwashInfo(carwash);
            CarwashService.retrieveProducts(carwash.id)
              .then((productList) => {
                setProducts(productList);
                setPricing(
                  productList.flatMap((product) => product.pricingList)
                );
                setSchedules(
                  productList.flatMap((product) => product.schedules)
                );
              })
              .catch((error) =>
                console.error("Error retrieving products:", error)
              );
          }
        });
      })
      .catch((error) => console.error("Error retrieving carwash info:", error))
      .finally(setLoading(false));
  }, [loading, user, trigger]);

  useEffect(() => {
    setTableData(apiOptions[selectedOption]);
  }, [carwashInfo, products, pricing, schedules, trigger]);

  // --- Handlers ---

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

  const handleClose = (change = false) => {
    setPopupData(null);
    if (change) {
      setTrigger((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        Options={apiOptions}
        selectedOption={selectedOption}
        onOptionClick={handleOptionClick}
      />

      <div className="flex-1 p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Carwash Owner Dashboard</h1>
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
              <AddComponent
                selectedOption={selectedOption}
                contextData={contextData}
                onClose={handleClose}
              />
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
              contextData={contextData}
            />
          </PopupContainer>
        )}
      </div>
    </div>
  );
}
