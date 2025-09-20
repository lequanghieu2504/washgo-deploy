import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const filterCarwashes = async (filterParams) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const { location, ...finalParams } = filterParams;
    if (filterParams.location) {
      const coordinates = await getCoordinatesFromLocation(
        filterParams.location
      );

      if (coordinates) {
        finalParams.latitude = coordinates.latitude;
        finalParams.longitude = coordinates.longitude;
      }
    }
    const param = new URLSearchParams(finalParams).toString();
    const response = await fetch(`${apiUrl}/api/filter?${param}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "anyvalue",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return {
      data: Array.isArray(data) ? data : [],
      query: filterParams,
      hasResults: Array.isArray(data) && data.length > 0,
    };
  } catch (error) {
    console.error("Filter API error:", error);
    return {
      data: [],
      query: filterParams,
      hasResults: false,
    };
  }
};

const getCoordinatesFromLocation = async (location) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${location}, Việt Nam`
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "washapp/1.0 (tunbin2697@gmail.com)",
      },
    });

    const data = await response.json();

    if (data.length > 0) {
      console.log("Nominatim location data:", data[0]);
      return {
        latitude: data[0].lat,
        longitude: data[0].lon,
      };
    }
    console.warn("No results found for location:", location);

    return null;
  } catch (error) {
    console.error(
      "Error fetching nominatim for location coordinate data:",
      error
    );
    return null;
  }
};

const FILTER_KEY = ["carwash-filter"];

export const useFilterCarwash = () => {
  const queryClient = useQueryClient();
  const {
    data: filterState,
    isLoading,
    isError,
  } = useQuery({
    queryKey: FILTER_KEY,
    queryFn: () => ({ data: [], query: {}, hasResults: false }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
  });
  const applyFilters = useCallback(
    async (newFilters) => {
      try {
        const result = await filterCarwashes(newFilters);
        queryClient.setQueryData(FILTER_KEY, result);
      } catch (error) {
        console.error("Failed to apply filters:", error);
        queryClient.setQueryData(FILTER_KEY, (prev) => ({
          ...prev,
          hasResults: false,
        }));
      } finally {
      }
    },
    [queryClient]
  );

  const removeFilters = useCallback(() => {
    queryClient.setQueryData(FILTER_KEY, {
      data: [],
      query: {},
      hasResults: false,
    });
  }, [queryClient]);

  return {
    applyFilters,
    removeFilters,
    isLoading,
    isError,
    carwashList: filterState?.data || [],
    query: filterState?.query || {},
    hasResults: filterState?.hasResults || false,
  };
};
