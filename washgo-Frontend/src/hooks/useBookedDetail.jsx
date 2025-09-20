import { useQuery } from "@tanstack/react-query";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

const fetchBookedDetail = async (bookingId, token) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  if (!token) {
    throw new Error("Not authenticated");
  }
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  const response = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch booking details");
  }
  return response.json();
};

export function useBookedDetail(bookingId) {
  const { accessToken } = useTokenRefresh();

  return useQuery({
    queryKey: ["bookedDetail", bookingId],

    queryFn: () => fetchBookedDetail(bookingId, accessToken),

    enabled: !!bookingId && !!accessToken,
    staleTime: 4 * 60 * 1000,
  });
}
