import React from "react"; // Import React
import { Link } from "react-router-dom";
import PropTypes from "prop-types"; // Import prop-types

// Simple Logo component with emphasis on "GO"
const WashGoLoGo = ({ className = "" }) => {
  return (
    // Container div - allows passing additional classes if needed
    <div className={`flex items-center ${className}`}>
      {/* Link wrapping the logo text */}
      <Link
        to="/" // Link destination
        // Base styles for the link
        className="text-[#cc0000] font-bold text-2xl hover:text-[#a30000] transition duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#cc0000] rounded"
      >
        {/* Text split into two parts */}
        Wash<span className="font-extrabold">GO</span> {/* Emphasize "GO" */}
      </Link>
    </div>
  );
};

// Define PropTypes
WashGoLoGo.propTypes = {
  className: PropTypes.string,
};

export default WashGoLoGo;
