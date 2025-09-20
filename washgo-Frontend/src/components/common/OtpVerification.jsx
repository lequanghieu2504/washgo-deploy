import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OtpVerification({ email, onVerified, onResend }) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API}/mail/verify-email?otp=${encodeURIComponent(otp)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "anyvalue",
          },
        }
      );
      const text = await response.text();

      if (!response.ok || text.trim() !== "Email verified successfully") {
        toast.error("Invalid OTP code.");
        setIsLoading(false);
        return;
      }

      toast.success("Email verification successful!");
      setTimeout(() => {
        onVerified(otp);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Invalid OTP code.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setTimeLeft(60);
      toast.success("OTP has been resent to your email.");
    } catch (error) {
      toast.error("Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="items-center justify-center min-h-screen bg-white">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-2xl border-gray-100 p-6 sm:p-8 mt-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Verify OTP
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Enter the OTP code sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter OTP code"
              required
              disabled={isLoading}
            />
          </div>

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
              "Verify"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {timeLeft > 0 ? (
            <span>Resend OTP in {timeLeft}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-[#cc0000] font-semibold hover:underline"
              disabled={isResending || isLoading}
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

OtpVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onVerified: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
};

export default OtpVerification;
