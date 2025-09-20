import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

export function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  } else if (!user || !roles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
