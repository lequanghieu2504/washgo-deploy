import { useQuery } from "@tanstack/react-query";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

const fetchClientBookingHistory = async (token) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${apiUrl}/api/bookings/my-bookings`, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch booking history");
  }
  return response.json();
};

export function useClientBookingHistory() {
  const { accessToken } = useTokenRefresh();

  return useQuery({
    queryKey: ["clientBookingHistory"],
    queryFn: () => fetchClientBookingHistory(accessToken),

    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
