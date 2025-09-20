import { useMutation } from "@tanstack/react-query";

const loginUser = async ({ username, password }) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "anyvalue",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  let data;

  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    const message = data?.message || "Login failed";
    throw new Error(message);
  }

  return data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {},

    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });
};
