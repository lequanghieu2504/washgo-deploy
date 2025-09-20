import React, { useState } from "react";
import PopupContainer from "../common/PopupContainer";
import FieldEditor from "../common/FieldEditor";

const AddComponent = ({ selectedOption, contextData, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [popupData, setPopupData] = useState({});

  const handleAddClick = () => {
    setPopupData({});
    setIsAdding(true); // Open the popup for adding
  };

  const handleClose = (change) => {
    setIsAdding(false);
    onClose(change);
  };

  return (
    <>
      <button
        onClick={handleAddClick}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
      >
        + Add New
      </button>

      {isAdding && (
        <PopupContainer title="Add New Entity" onClose={handleClose}>
          <FieldEditor
            selectedOption={selectedOption}
            onClose={handleClose}
            isAdding={true}
            contextData={contextData}
          />
        </PopupContainer>
      )}
    </>
  );
};

export default AddComponent;
