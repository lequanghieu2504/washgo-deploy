import React from "react";

const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Skeleton Header */}
      <div className="flex space-x-4 mb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 bg-gray-300 rounded w-1/4"></div>
        ))}
      </div>

      {/* Skeleton Rows */}
      <div className="space-y-4">
        {" "}
        {/* Increased vertical spacing between rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, cellIndex) => (
              <div
                key={cellIndex}
                className="h-10 bg-gray-200 rounded w-1/4"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
