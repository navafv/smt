import axios from "axios";

/**
 * 1. CONFIGURATION
 * We use Vite's environment variables to switch between Local and Production servers.
 * Ensure you have a .env file with VITE_API_URL=http://127.0.0.1:8000/api
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * 2. REFRESH TOKEN MUTEX & QUEUE
 * Prevents multiple simultaneous refresh calls (Race Conditions).
 * If 5 requests fail at once, we only call the refresh endpoint once.
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 3. REQUEST INTERCEPTOR
 * Automatically attaches the Access Token to the header of every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 4. RESPONSE INTERCEPTOR
 * The "Brain": Handles automatic token refreshing on 401 errors.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, wait in the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // We use a clean axios instance here to avoid infinite interceptor loops
        const res = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = res.data;
        localStorage.setItem("access_token", access);

        // Success! Resume all queued requests with the new token
        processQueue(null, access);

        // Retry the original request that failed
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden (Usually means the token is malformed or invalid)
    if (error.response?.status === 403) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);

/**
 * 5. SESSION CLEANUP
 * Wipes local storage and force-redirects to login with a "session=expired" flag.
 */
function handleSessionExpired() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // We use window.location because we are outside the React Router context here
  if (window.location.pathname !== "/login") {
    window.location.href = "/login?session=expired";
  }
}

export default api;
