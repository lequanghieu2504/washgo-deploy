import { useQuery, useQueryClient } from "@tanstack/react-query";
import { set } from "date-fns";
import { useEffect } from "react";

const refreshAccessToken = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  console.log("Refreshing access token...");

  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    // If the cookie is invalid/expired, the server will return an error (e.g., 401/403).
    // This will cause the query to fail, which is the correct behavior.
    throw new Error("Failed to refresh session. User is likely not logged in.");
  }

  const data = await response.json();
  const { accessToken } = data || {};

  if (!accessToken) {
    throw new Error("Refresh succeeded but no access token was returned.");
  }

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return { accessToken, userData: payload };
  } catch (e) {
    throw new Error("Received a malformed access token.");
  }
};

export const useTokenRefresh = () => {
  const {
    data: session,
    isLoading: isRefreshing,
    isError,
  } = useQuery({
    queryKey: ["session"],
    queryFn: refreshAccessToken,

    staleTime: 1000 * 60 * 4,
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    accessToken: session?.accessToken,
    userData: session?.userData,
    isRefreshing,
    isError,
  };
};
