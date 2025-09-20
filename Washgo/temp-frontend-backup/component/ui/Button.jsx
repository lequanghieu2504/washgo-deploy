import React from "react";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // Default to primary style
  className = "", // Default empty string
  disabled = false,
}) => {
  // Base styles applicable to all variants
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant-specific styles
  let variantStyles = "";
  switch (variant) {
    case "secondary":
      variantStyles =
        "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500";
      break;
    case "outline":
      variantStyles =
        "border border-[#cc0000] text-[#cc0000] bg-white hover:bg-red-50 focus:ring-[#cc0000]";
      break;
    case "ghost":
      variantStyles =
        "text-[#cc0000] bg-transparent hover:bg-red-50 focus:ring-[#cc0000] shadow-none"; // Example ghost button
      break;
    case "white-text-red-background":
      variantStyles =
        "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm bg-gray-600 text-white hover:bg-gray-700";
    case "primary": // Default case
    default:
      variantStyles =
        "bg-[#cc0000] text-white hover:bg-[#a30000] focus:ring-[#cc0000]";
      break;
  }

  return (
    <button
      onClick={onClick}
      type={type}
      // Combine base, variant, and any additional passed classes
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
