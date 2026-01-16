import axios from "axios";
import { loadingStore } from "../utils/loadingStore.js";

/**
 * Axios instance
 */
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Global loader interceptors
 * - enabled by default
 * - opt-out per request via { skipGlobalLoader: true }
 */
apiClient.interceptors.request.use(
  (config) => {
    if (config?.skipGlobalLoader) return config;
    loadingStore.increment();
    config.__hasGlobalLoader = true;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (response?.config?.__hasGlobalLoader) loadingStore.decrement();
    return response;
  },
  (error) => {
    if (error?.config?.__hasGlobalLoader) loadingStore.decrement();
    return Promise.reject(error);
  }
);

/**
 * Dev-only API error logging
 */
const isDev = typeof import.meta !== "undefined" && import.meta?.env?.DEV;

if (isDev) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      let requestData = error?.config?.data;

      if (typeof requestData === "string") {
        try {
          requestData = JSON.parse(requestData);
        } catch {
          // leave as-is
        }
      }

      console.error("[API ERROR]", {
        method: error?.config?.method,
        url: error?.config?.baseURL
          ? `${error.config.baseURL}${error?.config?.url || ""}`
          : error?.config?.url,
        status: error?.response?.status,
        response: error?.response?.data,
        request: requestData,
      });

      return Promise.reject(error);
    }
  );
}

/**
 * Centralized API error message extractor
 * Works for Axios & fetch-style errors
 */
export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  const messageFromData =
    data?.message ||
    data?.error ||
    data?.msg ||
    data?.details?.message ||
    (Array.isArray(data?.errors)
      ? data.errors
          .map((e) => e?.message || e)
          .filter(Boolean)
          .join(", ")
      : "");

  if (typeof messageFromData === "string" && messageFromData.trim())
    return messageFromData;

  if (typeof error?.message === "string" && error.message.trim())
    return error.message;

  if (error?.code === "ERR_NETWORK")
    return "Network error. Is the backend running?";

  return fallback;
};

export default apiClient;
