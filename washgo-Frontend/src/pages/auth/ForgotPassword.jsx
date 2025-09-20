import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/mail/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error("Failed to send OTP: " + text);
        setIsLoading(false);
        return;
      }

      toast.success("OTP has been sent to your email.");
      setStep(2);
    } catch (err) {
      toast.error("An error occurred while sending OTP: " + err.message);
    }
    setIsLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API}/mail/verify-forgot-password?OTP=${encodeURIComponent(otp)}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const text = await res.text();
        toast.error("Invalid OTP: " + text);
        setIsLoading(false);
        return;
      }

      toast.success("OTP is valid. Please set a new password.");
      setStep(3);
    } catch (err) {
      toast.error("An error occurred while verifying OTP: " + err.message);
    }
    setIsLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const text = await res.text();

      if (!res.ok) {
        toast.error(`Error: ${text}`);
        setIsLoading(false);
        return;
      }

      toast.success("Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error("An error occurred while resetting password: " + err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 items-center justify-center min-h-screen bg-white">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-2xl border-gray-100 p-6 sm:p-8 mt-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <div className="relative mb-5">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <button
              onClick={handleRequestOtp}
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
                "Send OTP"
              )}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative mb-5">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
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
                "Verify OTP"
              )}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative mb-5">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <button
              onClick={handleResetPassword}
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
                "Reset Password"
              )}
            </button>
          </>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;