import React from "react";
import PropTypes from "prop-types"; // Import prop-types
import EmptyDataBox from "./EmptyDataBox";

// Helper function to format keys (e.g., camelCase -> Title Case)
const formatHeader = (key) => {
  if (!key) return "";
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const Table = ({ data, onRowClick, className = "" }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyDataBox />;
  }

  const headers = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] !== "object" || data[0][key] === null
  );

  return (
    <div
      className={`mt-6 overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white ${className}`}
    >
      <table className="w-full text-sm text-left text-gray-700">
        {/* Table Header */}
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 font-semibold tracking-wider"
              >
                {formatHeader(header)}
              </th>
            ))}
          </tr>
        </thead>
        {/* Table Body */}
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index} // Prefer unique ID if available, fallback to index
              // Alternating row background (optional), hover effect, border
              className={`border-b border-gray-100 last:border-b-0 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-red-50 cursor-pointer transition duration-150 ease-in-out`}
              onClick={() => onRowClick && onRowClick(row)} // Ensure onRowClick exists
            >
              {headers.map((header) => (
                <td
                  key={`${header}-${row.id || index}`}
                  className="px-6 py-3 whitespace-nowrap"
                >
                  {/* Display different types of data appropriately */}
                  {typeof row[header] === "boolean"
                    ? row[header]
                      ? "Yes"
                      : "No" // Display booleans nicely
                    : typeof row[header] === "object" && row[header] !== null
                    ? JSON.stringify(row[header]) // Basic display for nested objects (consider better formatting)
                    : row[header]?.toString() || ""}{" "}
                  {/* Handle null/undefined */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Define PropTypes
Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired, // Expects an array of objects
  onRowClick: PropTypes.func, // Optional function when a row is clicked
  className: PropTypes.string, // Allow custom classes for the container
};

export default Table;
