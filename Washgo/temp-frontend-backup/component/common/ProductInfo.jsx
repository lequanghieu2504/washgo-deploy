import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types'; // Import prop-types for JS type checking
// Assuming ProductSchedule exists and needs separate styling
import ProductSchedule from "./ProductSchedule";



const ProductInfo = ({ carwashId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const accessToken = localStorage.getItem("accessToken"); // Use if needed, currently fetch doesn't send it

  // Example: Fetching all schedules - adjust API/logic as needed
  // This might not be needed if schedules are part of the product data already
  // const [allSchedules, setAllSchedules] = useState([]);
  // const [selectedSlot, setSelectedSlot] = useState(null);

  // Fetch Products for the specific carwash
  useEffect(() => {
    if (!carwashId) {
        setError("Carwash ID is missing.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    // NOTE: The fetch below currently doesn't use the accessToken. Add it back if required by your API.
    fetch(`http://localhost:8080/api/carwashes/${carwashId}/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Uncomment if needed
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => { // Make async to parse error body
          if (!res.ok) {
              let errorMsg = `Failed to fetch products: ${res.status}`;
              try {
                  const errorBody = await res.json();
                  errorMsg = errorBody.message || JSON.stringify(errorBody) || errorMsg;
              } catch(e) {/* Ignore */}
              throw new Error(errorMsg);
          }
          return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
          console.error("Fetch products error:", err);
          setError(err.message || "Could not load services.");
          setProducts([]);
          setIsLoading(false);
      });
  }, [carwashId]); // Dependency array includes carwashId

  // Find the selected product based on ID
  const selectedProduct = products.find(
    (p) => p.id?.toString() === selectedProductId // Handle number/string ID comparison
  );

  // Format time range (keep function as is)
  const formatTimeRange = (startStr, endStr) => {
    try {
        const start = new Date(startStr);
        const end = new Date(endStr);
        // Basic check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return "Invalid date range";
        }
        const date = start.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
        const startTime = start.toLocaleTimeString(undefined, {
            hour: "numeric", // Use numeric for potentially cleaner output e.g., 9:00 AM
            minute: "2-digit",
            hour12: true, // Use AM/PM
        });
        const endTime = end.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        // Handle cases where start/end time might be identical (though unlikely for a range)
        if (startTime === endTime) {
            return `${date}, ${startTime}`;
        }
        return `${date}, ${startTime} - ${endTime}`;
    } catch (e) {
        console.error("Error formatting time range:", e);
        return "Invalid date format";
    }
  };

  // Handle booking click (add logic here)
  const handleBooking = () => {
      if (!selectedProduct) {
          alert("Please select a service first.");
          return;
      }
      // Add logic to handle booking, potentially using selectedSlot if implemented
      alert(`Booking ${selectedProduct.name}... (Implement booking logic)`);
  };

  return (
    // Main container with consistent padding, bg, shadow, border, rounding
    <div className="max-w-5xl mx-auto p-6 lg:p-8 my-6 bg-white shadow-xl rounded-lg border border-gray-200">
      {/* Main Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center border-b pb-3">
        Services Offered
      </h1>

      {/* Loading State */}
      {isLoading && (
         <div className="text-center py-10 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl text-[#cc0000]"></i>
            <p className="mt-2">Loading services...</p>
         </div>
      )}

      {/* Error State */}
       {error && !isLoading && (
          <div className="my-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm text-center">
             <i className="fas fa-exclamation-circle mr-2"></i>
             <strong>Error:</strong> {error}
          </div>
       )}

      {/* Content shown only if not loading and no error */}
      {!isLoading && !error && (
          <>
            {/* Product Selector Dropdown */}
            <div className="mb-8">
                <label
                htmlFor="product-selector"
                // Consistent label styling
                className="block text-sm font-medium text-gray-700 mb-1"
                >
                Choose a Service:
                </label>
                <select
                    id="product-selector"
                    // Consistent input/select styling with red focus ring
                    className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out shadow-sm"
                    value={selectedProductId || ""}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                >
                    <option value="" disabled>-- Select a Service --</option> {/* Use disabled for placeholder */}
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                        {p.name} {/* Optionally add price: - ${p.price} */}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Product Info and Schedules Area */}
            {selectedProduct && (
                // Container for selected product details
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-inner"> {/* Inner shadow */}
                {/* Product Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {selectedProduct.name}
                </h2>
                {/* Product Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {selectedProduct.description}
                </p>

                {/* Schedule Section Title */}
                <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">
                    Availability
                </h3>

                {/* Product Schedule Component (Needs Styling) */}
                {/* <ProductSchedule
                    // Pass necessary props, e.g., schedules for this product or all schedules
                    // schedules={selectedProduct.schedules || allSchedules}
                    onSlotClick={(slotDateTime) => {
                      // Handle slot selection logic if using the interactive schedule
                      // setSelectedSlot(slotDateTime);
                      console.log("Slot selected:", slotDateTime);
                    }}
                /> */}
                 {/* Placeholder if ProductSchedule is not ready */}
                 <ProductSchedule schedules={[]} onSlotClick={()=>{}} />

                {/* Time Range Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {/* Check if schedules exist AND have length */}
                    {!selectedProduct.schedules || selectedProduct.schedules.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No specific time slots listed for this service.</p>
                    ) : (
                        selectedProduct.schedules.map((sch) => (
                            <div
                                key={sch.id}
                                // Consistent tag styling, use red for active/available
                                className={`text-xs px-3 py-1 rounded-full font-medium tracking-wide transition duration-150 ease-in-out shadow-sm cursor-default ${
                                    sch.isActive // Assuming isActive means available/bookable
                                    ? "bg-[#cc0000] text-white" // Red for active
                                    : "bg-gray-200 text-gray-600" // Gray for inactive
                                }`}
                                title={sch.isActive ? "Available Slot" : "Slot Not Available"} // Accessibility
                            >
                            {formatTimeRange(sch.availableFrom, sch.availableTo)}
                            </div>
                        ))
                    )}
                </div>

                {/* Booking Button Container */}
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200"> {/* Align button right */}
                    <button
                        onClick={handleBooking}
                        // Consistent primary button styling (red)
                        className="inline-flex items-center bg-[#cc0000] text-white px-6 py-2.5 rounded-md font-semibold text-sm shadow-md hover:bg-[#a30000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cc0000] transition duration-200 ease-in-out"
                    >
                        <i className="fas fa-calendar-check mr-2"></i> {/* Example Icon */}
                        Book Now
                    </button>
                </div>
                </div>
            )}
            {/* Message if no product is selected */}
            {!selectedProduct && products.length > 0 && (
                <div className="text-center text-gray-500 mt-10 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                   <i className="fas fa-arrow-up mr-2"></i> Please select a service above to see details and availability.
                </div>
            )}
          </>
      )}

    </div>
  );
};

// Define PropTypes for the component
ProductInfo.propTypes = {
  carwashId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ProductInfo;