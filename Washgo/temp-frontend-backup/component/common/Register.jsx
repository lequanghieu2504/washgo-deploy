import React, { useState } from "react"; // Added React import
import PropTypes from "prop-types"; // Import prop-types

function Register({ signin }) {
  const [showPassword, setShowPassword] = useState(false);
  // Keep the hardcoded initial state as provided
  const [password, setPassword] = useState("123");
  const [confirmPassword, setConfirmPassword] = useState("123");
  const [username, setUsername] = useState("123");
  const [phoneNumber, setPhoneNumber] = useState("1231231234");
  const [email, setEmail] = useState("123@gm.co");
  const [error, setError] = useState(""); // State for error messages

  const handlePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      // Use setError state instead of alert for better UX, but keeping alert as requested
      alert("Passwords do not match!");
      // setError("Passwords do not match!");
      return; // Stop submission
    }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "CLIENT",
        }),
      });

      const message = await response.text(); // Read response body

      if (!response.ok) {
        // Use error state for feedback
        setError(message || `Registration failed: ${response.status}`);
        throw new Error(message || `Registration failed: ${response.status}`);
      }

      console.log("Registration successful: ", message);
      signin(); // Navigate to sign in on success
    } catch (err) {
      console.error("Registration error:", err);
      // Set error state if not already set by response check
      if (!error) {
        setError("An error occurred during registration. Please try again.");
      }
      // Keep alert if preferred over inline error message
      // alert(error || "An error occurred during registration. Please try again.");
    }
  };

  return (
    // Use a slightly lighter gray for background
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      {" "}
      {/* Added padding */}
      {/* Registration Card */}
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-lg border border-gray-200">
        {" "}
        {/* Added border, more shadow */}
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
          {" "}
          {/* Darker text */}
          Create Account
        </h2>
        <h3 className="text-sm mb-6 text-center text-gray-600">
          {" "}
          {/* Slightly darker secondary text */}
          Sign up to get started
        </h3>
        {/* Display Error Message (Optional replacement for alert) */}
        {/* {error && (
            <div className="mb-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
                <i className="fas fa-exclamation-circle mr-1"></i> {error}
            </div>
         )} */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          {/* Added space-y */}
          {/* Username */}
          <div className="relative">
            {" "}
            {/* Removed mb-4 */}
            <i className="fas fa-user text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              id="reg-username" // Added unique id
              name="username" // Added name
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Username"
              required
            />
          </div>
          {/* Phone Number */}
          <div className="relative">
            {" "}
            {/* Removed mb-4 */}
            <i className="fas fa-phone-alt text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              id="reg-phone" // Added unique id
              name="phone" // Added name
              type="tel" // Changed type to "tel"
              pattern="[0-9]{10}" // Simplified pattern for 10 digits, adjust if needed
              title="Phone number should be 10 digits (e.g., 1234567890)" // Added title hint
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Phone number (10 digits)"
              required
            />
          </div>
          {/* Email */}
          <div className="relative">
            {" "}
            {/* Removed mb-4 */}
            <i className="fas fa-envelope text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              id="reg-email" // Added unique id
              name="email" // Added name
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Email"
              required
            />
          </div>
          {/* Password */}
          <div className="relative">
            {" "}
            {/* Removed mb-4 */}
            <i className="fas fa-lock text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              id="reg-password" // Added unique id
              name="password" // Added name
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={handlePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } text-sm`}
              ></i>
            </button>
          </div>
          {/* Re-enter Password */}
          <div className="relative">
            {" "}
            {/* Removed mb-6 */}
            <i className="fas fa-lock text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              id="reg-confirm-password" // Added unique id
              name="confirmPassword" // Added name
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Re-enter your password"
              required
            />
            <button
              type="button"
              onClick={handlePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } text-sm`}
              ></i>
            </button>
          </div>
          {/* Continue Button */}
          <button
            type="submit"
            // Styled with primary red color
            className="w-full bg-[#cc0000] text-white mt-6 py-2.5 rounded-md font-semibold shadow-sm hover:bg-[#a30000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cc0000] transition duration-200 ease-in-out"
          >
            Continue
          </button>
        </form>
        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {" "}
          {/* Darker secondary text */}
          Already have an account? {/* Styled link with primary red color */}
          <a
            className="font-semibold text-[#cc0000] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#cc0000] rounded"
            onClick={signin}
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

// Define PropTypes
Register.propTypes = {
  signin: PropTypes.func.isRequired, // Function to switch to the sign-in view
};

export default Register;
