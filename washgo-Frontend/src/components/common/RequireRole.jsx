import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

export function RequireRole({ roles = [] }) {
  const location = useLocation();
  const { accessToken, userData, isRefreshing } = useTokenRefresh();

  const isAuthLoading =
    isRefreshing || (!accessToken && isRefreshing === false);

  if (roles.length > 0 && isAuthLoading) {
    return <LoadingSpinner />;
  }
  if (roles.length === 0) {
    return <Outlet />;
  }

  if (!accessToken) {
    return <Navigate to="/guest-profile" replace state={{ from: location }} />;
  }

  const role = userData?.role;
  if (!role || !roles.includes(role)) {
    return <Navigate to="/unauthorize" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
