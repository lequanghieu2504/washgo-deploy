import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom"; // THE CHANGE: Import hooks
import FilterBox from "./FilterBox";
import { useFilterCarwash } from "@/hooks/useFilterCarwash";
import { useShowGlobalFilterState } from "@/hooks/useShowGlobalFilterState";
import {
  useControlBottomSheet,
  SHEET_HEIGHTS,
} from "@/hooks/useControlBottomSheet";
import { useCarwashRouteToMap } from "@/hooks/useCarwashRouteToMap";

export default function SearchBar({ className = "" }) {
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);
  const { applyFilters, query } = useFilterCarwash();
  const { setSheetHeight } = useControlBottomSheet();
  const {
    showFilter,
    isExpanded,
    setShowFilter,
    setIsExpanded,
    closeAll,
    toggleFilter,
  } = useShowGlobalFilterState();

  const { clearCarwashForMap } = useCarwashRouteToMap();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedParam = inputValue.trim();

    if (location.pathname !== "/map") {
      navigate("/map");
    }

    closeAll();
    applyFilters({
      carwashName: trimmedParam,
    });

    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClearSearch = () => {
    clearCarwashForMap();
    setSheetHeight(SHEET_HEIGHTS.HIDE);
    applyFilters({
      carwashName: "",
    });
  };

  const handleBack = () => {
    applyFilters({
      carwashName: "",
    });
    closeAll();
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleFilterClick = () => {
    toggleFilter();
  };

  const handleFilterResults = (results) => {
    closeAll();
  };

  const handleFilterClose = () => {
    setShowFilter(false);
    setIsExpanded(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    setInputValue(query.carwashName || "");
  }, [query.carwashName]);

  return (
    <>
      {/* Search Bar Container */}
      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        onFocus={handleInputFocus}
        className="flex w-full items-center justify-between gap-2"
      >
        {/* Back Button */}
        {(isExpanded || showFilter) && (
          <button type="button" onClick={handleBack} aria-label="Back">
            <i className="fas fa-arrow-left text-sm"></i>
          </button>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search car wash services..."
          value={inputValue}
          onChange={handleInputChange}
          className="flex-grow min-w-0 bg-transparent outline-none px-1"
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}

        {/* Filter Button */}
        {(isExpanded || showFilter) && (
          <button type="button" onClick={handleFilterClick} aria-label="Filter">
            <i className="fas fa-sliders-h text-sm"></i>
          </button>
        )}
      </form>
      {/* Filter Box Section */}
      {showFilter && (
        <div className="fixed top-[56px] left-0 w-full z-50 bg-transparent">
          <FilterBox
            onResults={handleFilterResults}
            onClose={handleFilterClose}
            searchParam={inputValue}
          />
        </div>
      )}
    </>
  );
}

SearchBar.propTypes = {
  onFilterResults: PropTypes.func,
  className: PropTypes.string,
};
