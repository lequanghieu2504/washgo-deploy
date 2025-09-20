import React from "react";
import PropTypes from 'prop-types'; // Import prop-types

const PopupContainer = ({ title, children, onClose, className = "" }) => {

  // Handle click on the overlay to close the popup (optional)
  const handleOverlayClick = (e) => {
      // Check if the click target is the overlay itself, not its children
      if (e.target === e.currentTarget && onClose) {
          onClose();
      }
  };

  return (
    // Overlay
    <div
       className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4"
       onClick={handleOverlayClick}
       role="dialog"
       aria-modal="true"
       aria-labelledby="popup-title"
    >
      {/* Popup Card */}
      <div
         className={`
            bg-white shadow-xl rounded-lg
            w-full max-w-3xl max-h-[90vh]
            flex flex-col overflow-hidden border border-gray-200
            ${className}
         `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 id="popup-title" className="text-lg font-semibold text-gray-800">{title}</h3>
           {/* Close Button */}
           {onClose && (
             <button
               onClick={onClose}
               className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 rounded-full p-1 transition duration-150 ease-in-out"
               aria-label="Close popup"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
               </svg>
             </button>
           )}
        </div>
        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

// Define PropTypes for type checking in JavaScript
PopupContainer.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func, // Optional close handler
  className: PropTypes.string,
};

export default PopupContainer;