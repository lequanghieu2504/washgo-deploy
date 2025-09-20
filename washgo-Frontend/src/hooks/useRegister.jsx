import { useState } from "react";
import { toast } from "react-toastify";

export default function useRegister({ onOtpSuccess }) {
  const [password, setPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [step, setStep] = useState("register");
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleRegister = async (e) => {
    e.preventDefault();

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phonenumber)) {
      toast.error("Please enter a valid phone number (9–11 digits).");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/mail/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "anyvalue",
        },
        body: JSON.stringify({
          email,
          password,
          role: "CLIENT",
          phonenumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Failed to send OTP";
        if (data?.message?.includes("Email already in use")) {
          msg = "Failed to send OTP, PhoneNumber already use";
        }
        toast.error(msg);
        return;
      }

      toast.success("OTP sent to your email!");
      setStep("otp");
      if (onOtpSuccess) onOtpSuccess();
    } catch (err) {
      toast.error("Error sending OTP: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP
  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/mail/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "anyvalue",
        },
        body: JSON.stringify({
          email,
          password,
          role: "CLIENT",
          phonenumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || "An unexpected error occurred.";
        toast.error(msg);
      } else {
        toast.success("OTP resent!");
      }
    } catch (err) {
      toast.error("Error resending OTP: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
