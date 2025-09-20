import { useEffect } from "react";
import { Link } from "react-router-dom";

function Logout() {
  // Renamed function for clarity
  async function handleLogout() {
    const refreshToken = " " + localStorage.getItem("refreshToken");

    // Clear local storage immediately for faster UI update
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("Local storage tokens cleared."); // Log clearance

    // If no refresh token exists, no need to call backend
    if (!refreshToken) {
      console.log("No refresh token found, skipping backend logout call.");
      return;
    }

    // Call backend logout endpoint (best effort)
    try {
      console.log("Attempting to call backend logout endpoint..."); // Log backend call attempt
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const responseText = await response.text(); // Read response text regardless of status

      if (!response.ok) {
        // Log backend failure with more detail
        console.error(
          `Backend logout failed: ${response.status} - ${responseText}`
        );
        // Throwing an error here might not be necessary unless you need to handle it further up
        // throw new Error(`Backend logout failed: ${response.status} - ${responseText}`);
      } else {
        console.log("Backend logout successful:", responseText); // Log backend success
      }
    } catch (err) {
      // Log any network or other errors during the fetch
      console.error("Error calling backend logout endpoint:", err);
    }
  }

  // Perform logout actions when the component mounts
  useEffect(() => {
    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // Center content vertically and horizontally, light gray background
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      {/* Card container with shadow, padding, etc. */}
      <div className="bg-white shadow-xl rounded-lg p-8 sm:p-10 max-w-md w-full border border-gray-200">
        {" "}
        {/* Increased padding on larger screens */}
        {/* Checkmark Icon for visual feedback */}
        <div className="mb-5">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        {/* Heading - Adjusted size and color */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Logged Out Successfully
        </h1>
        {/* Paragraph text - Adjusted color */}
        <p className="text-gray-600 mb-8">You have been securely logged out.</p>
        {/* Link styled as the primary button */}
        <Link
          to="/login"
          // Apply primary red color, hover/focus states, and transitions
          className="inline-block bg-[#cc0000] text-white font-medium py-2.5 px-6 rounded-lg shadow hover:bg-[#a30000] focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default Logout;
