import axios from "axios";
import { getSession, signOut } from "next-auth/react";


const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async function (config) {
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();

        if (session?.access_token) {
          config.headers["Authorization"] = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error("Error setting auth header:", error);
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (err) {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();

        if (!session?.refresh_token) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `/open-api/v1/refresh_token`,
          {
            refresh_token: session.refresh_token,
          },
        );

        if (response.data && response.data.data) {
          const { access_token } = response.data.data;
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

          return axiosInstance(originalRequest);
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (error) {
        console.error("Token refresh failed:", error);

        if (typeof window !== "undefined") {
          signOut({ callbackUrl: "/login" });
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(err);
  },
);

export default axiosInstance;
