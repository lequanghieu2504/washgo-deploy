import React from "react";

// Define Props Type
function Switch({
  checked,
  onChange,
  className = "",
  id,
  disabled = false,
  ...props // Capture aria attributes etc.
}) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked); // Call onChange with the new state
    }
  };

  return (
    <button
      type="button" // Use button type
      role="switch" // Accessibility role
      aria-checked={checked} // Accessibility state
      id={id}
      onClick={handleToggle}
      disabled={disabled}
      // Base container styles, including focus ring
      className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cc0000] 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-[#cc0000]" : "bg-gray-300"} 
        ${className}`}
      {...props} // Spread other props like aria-label
    >
      {/* Screen reader text (optional but good for accessibility) */}
      <span className="sr-only">Use setting</span>

      {/* Inner Circle/Thumb */}
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 
           transition duration-200 ease-in-out
           ${checked ? "translate-x-5" : "translate-x-0"}`}
      ></span>
    </button>
  );
}

export default Switch;
