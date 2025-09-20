import React, { useState, useRef } from "react"; // Added React import
import { useNavigate } from "react-router-dom";

function Login({ signup }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const errorTimeoutRef = useRef(null); // Ref to store the timeout ID

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Consider parsing error message from response body if available
        throw new Error(`Login failed with status: ${response.status}`);
      }

      const payload = await response.json();
      if (payload) {
        const { refreshToken, accessToken } = payload;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // Decode role from JWT (ensure proper error handling for parsing/decoding)
        try {
          const role = JSON.parse(atob(accessToken.split(".")[1])).role;

          if (role === "ADMIN") {
            navigate("/admin");
          } else if (role === "CLIENT") {
            navigate("/home");
          } else if (role === "CARWASH") {
            // Corrected '==' to '==='
            navigate("/carwashowner");
          } else {
            // Handle unexpected roles or redirect to a default page
            navigate("/home");
          }
        } catch (jwtError) {
          console.error("Error decoding token or navigating:", jwtError);
          // Handle error, maybe navigate to home or show generic error
          navigate("/home"); // Fallback navigation
          setLoginError(true); // Optionally show login error
        }
      }
      setLoginError(false); // Reset error on success
    } catch (error) {
      setLoginError(true); // Show error box on login failure
      console.error("Login error: ", error);

      // Automatically hide the error box after 2 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setLoginError(false);
      }, 3000); // Increased timeout slightly
    }
  };

  const handleFocus = () => {
    if (errorTimeoutRef.current) {
      // Clear timeout if user interacts
      clearTimeout(errorTimeoutRef.current);
    }
    setLoginError(false); // Hide error box when user focuses on input
  };

  const redirectToGoogle = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/auth/login-google-url"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Google login URL with status: ${response.status}`
        );
      }

      const authUrl = await response.text();
      window.location.href = authUrl; // Redirect the current window
    } catch (error) {
      console.error("Error during Google login redirection: ", error);
      // Optionally show an error message to the user
    }
  };

  return (
    // Use a slightly lighter gray for background
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      {" "}
      {/* Added padding */}
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white p-8 shadow-xl rounded-lg border border-gray-200">
        {" "}
        {/* Added border, more shadow */}
        {/* Error Box - Positioned relative to card, styled subtly */}
        {loginError && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-4 w-11/12 max-w-sm">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm shadow-md animate-fade-in-out">
              <i className="fas fa-exclamation-circle mr-2"></i> Invalid
              username or password.
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
          {" "}
          {/* Darker text */}
          Welcome Back!
        </h2>
        <h3 className="text-sm mb-6 text-center text-gray-600">
          {" "}
          {/* Slightly darker secondary text */}
          Please enter your account here
        </h3>
        <form onSubmit={handleLogin} className="space-y-4">
          {" "}
          {/* Added space between form elements */}
          {/* Username Input */}
          <div className="relative">
            {" "}
            {/* Removed mb-4, handled by form space-y */}
            <i className="fas fa-user text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>{" "}
            {/* User Icon */}
            <input
              type="text"
              id="username"
              name="username" // Added name attribute
              autoComplete="username" // Added autocomplete hint
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={handleFocus}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Username"
              required
            />
          </div>
          {/* Password Input */}
          <div className="relative">
            {" "}
            {/* Removed mb-4 */}
            <i className="fas fa-lock text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"></i>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password" // Added name attribute
              autoComplete="current-password" // Added autocomplete hint
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleFocus}
              // Styled input with red focus ring
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition duration-150 ease-in-out"
              placeholder="Password"
              required
            />
            <button
              type="button" // Make it a button, not submit
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
            >
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } text-sm`}
              ></i>
            </button>
          </div>
          {/* Forgot Password */}
          <div className="text-right">
            {" "}
            {/* Removed mb-6 */}
            <a
              // Changed text color and hover/focus states
              className="text-sm text-gray-600 hover:text-[#cc0000] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#cc0000] rounded"
              onClick={signup} // Assuming signup prop navigates to forgot password or signup
            >
              Forgot password?
            </a>
          </div>
          {/* Login Button */}
          <button
            type="submit"
            // Styled with primary red color
            className="w-full bg-[#cc0000] text-white py-2.5 rounded-md font-semibold shadow-sm hover:bg-[#a30000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cc0000] transition duration-200 ease-in-out"
          >
            Login
          </button>
        </form>
        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="border-t border-gray-300 flex-grow"></div>{" "}
          {/* Use flex-grow */}
          <span className="mx-4 text-gray-500 text-xs uppercase font-medium">
            Or continue with
          </span>{" "}
          {/* Adjusted text */}
          <div className="border-t border-gray-300 flex-grow"></div>{" "}
          {/* Use flex-grow */}
        </div>
        {/* Google Login Button */}
        <button
          onClick={redirectToGoogle}
          // Styled secondary button
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000] focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          <img
            // Consider hosting the logo locally or using an SVG icon library
            src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
            alt="Google Logo"
            className="w-4 h-4 mr-2" // Adjusted size
          />
          Google
        </button>
        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {" "}
          {/* Darker secondary text */}
          Don’t have an account? {/* Styled link with primary red color */}
          <a
            className="font-semibold text-[#cc0000] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#cc0000] rounded"
            onClick={signup}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
