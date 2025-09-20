// components/ui/input.tsx
import React from "react";

export const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
      className={`
        w-full rounded-md border border-gray-300 px-4 py-2 
        bg-white text-gray-900 
        placeholder:text-gray-400 
        transition duration-150 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 
        ${className}
      `}
    />
  );
};
