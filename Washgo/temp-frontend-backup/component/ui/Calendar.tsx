// components/ui/calendar.tsx
import React from "react";

// Define Props Type
interface CalendarProps {
  value: string; // Expecting value in "YYYY-MM-DD" format for input type="date"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Allow passing additional classes
  disabled?: boolean; // Add disabled prop
  id?: string; // Add id for label association
  name?: string; // Add name attribute
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  className = "",
  disabled = false,
  id,
  name,
}) => {
  return (
    <input
      type="date"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      // Apply consistent input styling + red focus ring
      className={`
        w-full rounded-md border border-gray-300 px-4 py-2 
        bg-white text-gray-900 
        transition duration-150 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100
        ${className} 
        // Add specific styles for the date picker indicator appearance if needed, 
        // though browser support varies. Example for WebKit browsers:
        // [&::-webkit-calendar-picker-indicator]:text-gray-500 [&::-webkit-calendar-picker-indicator]:hover:text-[#cc0000]
      `}
    />
  );
};

// Optional: Export the props type
// export type { CalendarProps };