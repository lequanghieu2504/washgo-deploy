import axios from "axios";
import { useEffect } from "react";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

const authBridge = {
  getAccessToken: () => null, // updated by hook
  refresh: async () => null, // updated by hook
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true, // send cookies (for refresh)
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "anyvalue",
  },
});

export function setApiBaseURL(url) {
  api.defaults.baseURL = url;
}

export function setDefaultHeaders(headers = {}) {
  Object.assign(api.defaults.headers.common, headers);
}

// Attach Authorization from current access token
api.interceptors.request.use((config) => {
  const token = authBridge.getAccessToken?.();
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Refresh-once-then-retry for 401/403
let refreshingPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    const status = response?.status;

    if (!config || config._retry) throw error;
    if (status !== 401 && status !== 403) throw error;

    config._retry = true;

    try {
      if (!refreshingPromise) {
        refreshingPromise = (async () => {
          const newToken = await authBridge.refresh?.();
          return newToken || null;
        })();
      }
      const newToken = await refreshingPromise;
      refreshingPromise = null;

      if (!newToken) throw error; // refresh failed -> propagate

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (e) {
      refreshingPromise = null;
      throw e;
    }
  }
);

// Bind the axios client to your auth hook. Call once near App root.
export function useBindApiToAuth() {
  const { accessToken, getNewToken } = useTokenRefresh();

  useEffect(() => {
    authBridge.getAccessToken = () => accessToken || null;
  }, [accessToken]);

  useEffect(() => {
    authBridge.refresh = async () => {
      try {
        const result = await getNewToken();
        return result?.accessToken || null;
      } catch {
        return null;
      }
    };
  }, [getNewToken]);
}

export default api;
