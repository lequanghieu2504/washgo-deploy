import React, { useState, useEffect } from "react"; // Import useEffect if needed for fetching initial data

export default function UserInfo() {
  // Placeholder data - In a real app, fetch this via useEffect
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+123456789",
    address: "123 Main St, New York, NY",
  });

  const [formData, setFormData] = useState(user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Use a state for success message

  // Fetch user data on component mount (example)
  // useEffect(() => {
  //   // fetch('/api/user/profile') // Your API endpoint
  //   //  .then(res => res.json())
  //   //  .then(data => {
  //   //    setUser(data);
  //   //    setFormData(data);
  //   //  })
  //   //  .catch(err => console.error("Failed to fetch user data:", err));
  // }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage(""); // Clear success message on change
  };

  const handleToggleEdit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      // Here you would typically send an API request to save the formData
      console.log("Saving data:", formData);
      // Mock saving:
      setUser(formData); // Update the display data
      setSuccessMessage("Changes saved successfully!"); // Set success message
      // Optionally hide success message after a few seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
        setSuccessMessage(""); // Clear message when entering edit mode
    }
    setIsEditMode(!isEditMode); // Toggle edit mode
  };

  return (
    // Add padding around the component within the main layout
    <div className="p-6 lg:p-8">
       {/* Container for the form */}
       <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center border-b pb-3">
            User Information
        </h1>

        <form onSubmit={handleToggleEdit} className="space-y-5"> {/* Increased space */}
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
               {/* Label Styling */}
              <label htmlFor={key} className="block text-sm font-medium capitalize mb-1 text-gray-700">
                {/* Simple formatting for the key name */}
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                id={key} // Add id for label association
                type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} // Use appropriate input types
                name={key}
                value={value}
                onChange={handleChange}
                readOnly={!isEditMode}
                 // Input Styling - Differentiate between view and edit modes
                className={`w-full rounded-md border px-4 py-2 transition duration-150 ease-in-out
                  ${
                    isEditMode
                      ? "border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent" // Red focus ring in edit mode
                      : "bg-gray-100 text-gray-600 border-gray-200 cursor-default" // Read-only appearance
                  }`}
              />
            </div>
          ))}

          {/* Button Styling */}
          <button
             type="submit"
             // Style changes based on mode: Red for "Save", Gray for "Edit"
             className={`w-full mt-6 py-2.5 px-4 rounded-md font-semibold text-sm shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
               ${
                 isEditMode
                   ? "bg-[#cc0000] text-white hover:bg-[#a30000] focus:ring-[#cc0000]" // Primary red for Save
                   : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500" // Secondary gray for Edit
               }`}
            >
             {isEditMode ? (
                 <> <i className="fas fa-save mr-2"></i> Save Changes </>
             ) : (
                 <> <i className="fas fa-pencil-alt mr-2"></i> Edit Information </>
             )}
          </button>

           {/* Success Message Styling */}
          {successMessage && !isEditMode && (
            <div className="mt-4 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
               <i className="fas fa-check-circle mr-2"></i>
               {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}