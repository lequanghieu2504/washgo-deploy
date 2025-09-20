import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

const LOCATION_KEY = ["clientLocation"];
const STORAGE_KEY = "clientLocation:v1";

const defaultPosition = [10.762622, 106.660172];

const fetchIPLocation = async () => {
  console.log("Fetching location from IP...");

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve({
          latitude: defaultPosition[0],
          longitude: defaultPosition[1],
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  });
};

const defaultValue = {
  latitude: defaultPosition[0],
  longitude: defaultPosition[1],

  locationChangeRequested: true,
};

export const useLocation = () => {
  const queryClient = useQueryClient();

  const initialFromStorage =
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const {
    data: location = defaultValue,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: LOCATION_KEY,
    queryFn: fetchIPLocation,

    initialData: initialFromStorage
      ? { ...defaultValue, ...initialFromStorage }
      : undefined,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 0,

    onSuccess: (pos) => {
      queryClient.setQueryData(LOCATION_KEY, (prev = defaultValue) => ({
        ...prev,
        latitude: pos.latitude,
        longitude: pos.longitude,
        locationChangeRequested: false,
      }));
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {}
  }, [location]);

  const setLocation = useCallback(
    (newLoc) => {
      queryClient.setQueryData(LOCATION_KEY, (prev = defaultValue) => ({
        ...prev,
        ...newLoc,
        locationChangeRequested: false,
      }));
    },
    [queryClient]
  );

  const requestLocationChange = useCallback(() => {
    queryClient.setQueryData(LOCATION_KEY, (prev = defaultValue) => ({
      ...prev,
      locationChangeRequested: true,
    }));
  }, [queryClient]);

  const clearLocationChangeRequest = useCallback(() => {
    console.log("clearLocationChangeRequest called");

    queryClient.setQueryData(LOCATION_KEY, (prev = defaultValue) => ({
      ...prev,
      locationChangeRequested: false,
    }));
  }, [queryClient]);

  const clearStoredLocation = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    queryClient.removeQueries({ queryKey: LOCATION_KEY, exact: true });
  }, [queryClient]);

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    locationChangeRequested: location.locationChangeRequested,
    isLoading,
    isError,
    setLocation,
    requestLocationChange,
    clearLocationChangeRequest,
    clearStoredLocation,
    refetchLocation: refetch,
  };
};
