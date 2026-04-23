import axios from "axios";

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
        // Need to call refresh from the auth context
        // Since we can't call hooks in interceptors, use localStorage
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post("/api/auth/refresh", { refresh_token: refreshToken });
        localStorage.setItem("access_token", data.access_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
        return axios(originalRequest);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
