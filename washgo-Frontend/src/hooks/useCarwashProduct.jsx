import { useQuery } from "@tanstack/react-query";

const fetchCarwashProducts = async (carwashId) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(
    `${apiUrl}/api/carwashes/${carwashId}/products`,
    {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "anyvalue",
      },
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message ||
        `Failed to fetch products for carwash ${carwashId}. Status: ${response.status}`
    );
  }
  return response.json();
};

export const useCarwashProducts = (carwashId) => {
  return useQuery({
    queryKey: ["carwashProducts", carwashId],
    queryFn: () => fetchCarwashProducts(carwashId),
    enabled: !!carwashId,
    staleTime: 5 * 60 * 1000,
  });
};
