import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export const api = axios.create({
  baseURL: "/",
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAuth.refresh();
        originalRequest.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`;
        return axios(originalRequest);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
