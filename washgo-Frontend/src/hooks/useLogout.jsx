import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const serverLogout = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
    },

    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Server logout failed.");
  }
  return response.json();
};

export function useLogout() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: serverLogout,
    onSuccess: () => {
      console.log(t("logout.backend_call_success"));

      queryClient.removeQueries({ queryKey: ["session"] });
      console.log(t("logout.local_storage_cleared"));

      // navigate("/");
    },
    onError: (err) => {
      console.error(t("logout.backend_call_error"), err);

      queryClient.removeQueries({ queryKey: ["session"] });
      // navigate("/");
    },
  });

  return { logout, isLoggingOut };
}
