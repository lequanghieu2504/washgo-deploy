import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaLock, FaEye, FaEyeSlash, FaMailBulk } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OtpVerification from "@/components/common/OtpVerification";
import useRegister from "@/hooks/useRegister";

function Register() {
  const navigate = useNavigate();
  const API = "http://localhost:8080";
  const [showPassword, setShowPassword] = useState(false);

  const {
    password,
    setPassword,
    phonenumber,
    setPhonenumber,
    isLoading,
    step,
    setStep,
    handleRegister,
    resendOtp,
    email,
    setEmail,
  } = useRegister({
    navigate,
    toast,
  });

  if (step === "otp") {
    return (
      <>
        <ToastContainer />
        <OtpVerification
          email={email}
          onVerified={() => {
            toast.success("OTP verified successfully! Please login.");
            navigate("/login");
          }}
          onResend={resendOtp}
        />
      </>
    );
  }

  const redirectToGoogle = () => {
    window.location.href = `${API}/oauth2/authorization/google`;
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-gray-100 p-6 sm:p-8 shadow">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
            Sign Up
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Phone */}
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Phone number (for later login)"
                required
                disabled={isLoading}
              />
            </div>

            {/* For Testing create account with email */}
            <div className="relative">
              <FaMailBulk className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Email (for sending OTP)"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#cc0000] hover:bg-[#a30000] text-white py-3 rounded-xl font-semibold transition duration-300 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                "Get OTP"
              )}
            </button>
          </form>

          {/* OR */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* Google Login */}
          <button
            onClick={redirectToGoogle}
            className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
              alt="Google Logo"
              className="w-5 h-5 mr-2"
            />
            Google
          </button>

          {/* Sign in Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?
            <button
              type="button"
              className="font-semibold text-[#cc0000] hover:underline ml-1"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              type="button"
              className="font-semibold text-[#cc0000] hover:underline"
              onClick={() => navigate("/")}
              disabled={isLoading}
            >
              Back to Home
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
