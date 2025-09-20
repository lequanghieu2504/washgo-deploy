// components/ui/input.tsx
import React from "react";

// Define Props Type for better type safety
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // We extend the standard HTML input attributes to allow passing things like 'name', 'id', 'required', etc.
  // We explicitly define props we handle differently or want to emphasize.
  value: string | number; // Allow number type as well
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; // Keep type flexible, default to "text"
  placeholder?: string;
  className?: string; // Allow passing additional classes
  // 'disabled' is already included in React.InputHTMLAttributes
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  disabled, // Destructure disabled from props (or rely on {...props})
  ...props // Spread remaining standard input attributes (like name, id, required, etc.)
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      // Spread other native input props
      {...props}
      // Apply consistent input styling + red focus ring
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

// Optional: Export the props type
// export type { InputProps };