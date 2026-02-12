import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
    config.headers["Accept"] = "application/json";
  }

  const admin = JSON.parse(sessionStorage.getItem("admin_credentials"));
  const user = JSON.parse(sessionStorage.getItem("user_credentials"));
  const superAdmin = JSON.parse(sessionStorage.getItem("super_credentials"));

  const token =
    admin?.access_token || user?.access_token || superAdmin?.access_token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.detail || error.response?.data?.message;
    if (status === 401) {
      throw error;
    } else if ([400, 403, 404, 409].includes(status)) {
      let errorMessage = "An error occurred. Please try again.";
      switch (status) {
        case 400:
          errorMessage =
            message || "Bad Request. Please check the input and try again.";
          break;
        case 403:
          errorMessage =
            message ||
            "Forbidden. You do not have permission to access this resource.";
          break;
        case 404:
          errorMessage =
            message || "Not Found. The requested resource could not be found.";
          break;
        case 409:
          errorMessage =
            message || "Conflict. There was a conflict with your request.";
          break;
      }
      toast.error(errorMessage);
    } else if (status >= 500) {
      toast.error(
        message || "An internal server error occurred. Please try again later.",
      );
    } else if (!status) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
