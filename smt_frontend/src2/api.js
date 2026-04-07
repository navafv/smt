import axios from "axios";

/**
 * 1. CONFIGURATION
 * We use Vite's environment variables to keep our API URLs flexible.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // MANDATORY: This allows the browser to send the HttpOnly refresh cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * 2. IN-MEMORY TOKEN STORAGE (Senior Security Move)
 * We do NOT store the access_token in localStorage. This prevents it from being
 * stolen by malicious scripts (XSS). It lives only in JS memory while the tab is open.
 */
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * 3. REFRESH QUEUE MANAGEMENT
 * If 5 requests fail at the same time, this ensures we only call /refresh/ once.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((pendingRequest) => {
    if (error) {
      pendingRequest.reject(error);
    } else {
      pendingRequest.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 4. SILENT REFRESH LOGIC
 * Re-authenticates the session using the HttpOnly refresh cookie.
 * If this fails, the error bubbles up to the interceptor or caller
 * to trigger the logout flow.
 */
export async function refreshAccessToken() {
  const res = await axios.post(
    `${BASE_URL}/auth/refresh/`,
    {}, // Empty body; token is secured in the cookie
    {
      withCredentials: true,
      headers: { Accept: "application/json" },
    },
  );

  const { access } = res.data;

  // Update the in-memory token for the SMT Fruits session
  setAccessToken(access);

  return access;
}

/**
 * 5. REQUEST INTERCEPTOR
 * Injects the In-Memory Access Token into the header of every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 6. RESPONSE INTERCEPTOR
 * Automatically detects 401 (Expired) errors and triggers the Silent Refresh.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect 401 errors, ensuring we don't loop on the /auth/ endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/")
    ) {
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

      try {
        const token = await refreshAccessToken();
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden usually means a malformed token or permission issue
    if (error.response?.status === 403) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);

/**
 * 7. GLOBAL LOGOUT / SESSION CLEANUP
 * Clears memory and redirects the user to the login screen.
 */
export function handleSessionExpired() {
  setAccessToken(null);

  // Bridge to React state if AuthContext has registered a global logout function
  if (typeof window.__SMT_LOGOUT__ === "function") {
    window.__SMT_LOGOUT__();
    return;
  }

  if (window.location.pathname !== "/login") {
    window.location.href = "/login?session=expired";
  }
}

export default api;
