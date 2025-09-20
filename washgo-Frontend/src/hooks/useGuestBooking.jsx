import { useMutation } from "@tanstack/react-query";

const createGuestBooking = async (bookingData) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(`${apiUrl}/api/bookings/bookingByPhoneNumber`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useGuestBooking = () => {
  return useMutation({
    mutationFn: createGuestBooking,
    onSuccess: (data) => {
      console.log("Guest booking created successfully:", data);
    },
    onError: (error) => {
      console.error("Guest booking failed:", error);
    },
  });
};
