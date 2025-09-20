// components/ui/label.tsx
import React from "react";

// Define Props Type for better type safety
// Extend standard label attributes
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  // 'htmlFor' is already part of LabelHTMLAttributes
  className?: string; // Allow passing additional classes
}

export const Label: React.FC<LabelProps> = ({
  children,
  className = "",
  htmlFor, // Destructure htmlFor explicitly or rely on {...props}
  ...props // Spread remaining standard label attributes
}) => {
  return (
    <label
      htmlFor={htmlFor}
      // Combine base styles with any additional passed classes
      // Adjusted text size to text-sm for consistency
      className={`
        block text-sm font-medium text-gray-700 mb-1 
        ${className}
      `}
      // Spread other native label props
      {...props}
    >
      {children}
    </label>
  );
};

// Optional: Export the props type
// export type { LabelProps };