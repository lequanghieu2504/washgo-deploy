import React from "react";

const FieldSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Skeleton for Input Fields */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          {/* Label Skeleton */}
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          {/* Input Skeleton */}
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}

      {/* Skeleton for Textarea */}
      <div className="space-y-2">
        {/* Label Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        {/* Textarea Skeleton */}
        <div className="h-20 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Skeleton for Button */}
      <div className="flex space-x-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-10 bg-gray-300 rounded w-1/4"></div>
        ))}
      </div>
    </div>
  );
};

export default FieldSkeleton;
