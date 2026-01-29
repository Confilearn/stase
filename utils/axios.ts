import Axios from "axios";

const baseURL = __DEV__ ? "" : process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn("API base URL is not configured");
}

export const axiosInstance = Axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token (clerkUserId)
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const { tokenStorage } = await import("./tokenStorage");
    const clerkUserId = await tokenStorage.getToken();

    if (clerkUserId) {
      config.headers.Authorization = `Bearer ${clerkUserId}`;
    }
  } catch (error) {
    console.error("Error adding auth token:", error);
  }

  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
