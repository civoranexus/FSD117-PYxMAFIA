import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Dev-only logging to make API failures obvious in the console.
const isDev = typeof import.meta !== 'undefined' && import.meta?.env?.DEV;
if (isDev) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      let requestData = error?.config?.data;
      if (typeof requestData === 'string') {
        try {
          requestData = JSON.parse(requestData);
        } catch {
          // leave as-is
        }
      }

      console.error('[API ERROR]', {
        method: error?.config?.method,
        url: error?.config?.baseURL ? `${error.config.baseURL}${error?.config?.url || ''}` : error?.config?.url,
        status: error?.response?.status,
        response: error?.response?.data,
        request: requestData,
      });

      return Promise.reject(error);
    }
  );
}

export default apiClient;
