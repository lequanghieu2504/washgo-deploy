import { useMutation, useQueryClient } from "@tanstack/react-query";

const createClientBooking = async (bookingData, token) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  if (!token) {
    throw new Error("Authentication error: No access token found.");
  }

  const response = await fetch(`${apiUrl}/api/bookings/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useClientBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => {
      const token = queryClient.getQueryData(["session"])?.accessToken;
      return createClientBooking(bookingData, token);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientBookingHistory"] });
    },
    onError: (error) => {
      console.error("Client booking failed:", error);
    },
  });
};
