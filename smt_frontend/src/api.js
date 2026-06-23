import axios from "axios";

/**
 * 1. NETWORK ENVIRONMENT CONFIGURATION
 * Determines root destination coordinates from active system layer injection variables.
 */
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api");
const WARMUP_ENABLED = import.meta.env.VITE_ENABLE_API_WARMUP !== "false";
const ABSOLUTE_API_URL = /^https?:\/\//i.test(BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for passing HttpOnly verification cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * 2. IN-MEMORY TOKEN STORAGE (Defensive Security Pattern)
 * Isolates transient authorization tokens inside Javascript execution runtime space
 * to block cross-site scripting (XSS) extraction attempts.
 */
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];
let warmupPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Wakes up container environments that scale down automatically due to inactivity.
 * Runs early in the app initialization cycle to prevent user-facing interface lag.
 */
export function warmUpBackend() {
  if (!WARMUP_ENABLED || !ABSOLUTE_API_URL) {
    return Promise.resolve();
  }

  if (!warmupPromise) {
    warmupPromise = axios
      .get(`${BASE_URL}/health/`, {
        withCredentials: false,
        timeout: 70000,
      })
      .catch(() => null);
  }

  return warmupPromise;
}

/**
 * 3. ASYNCHRONOUS TRANSACTION QUEUE MANAGEMENT
 * Resolves or rejects multiple pending resource network calls
 * once an active background refresh cycle completes.
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
 * 4. SILENT REFRESH PROCESSING
 * Authenticates the current web session using securely stored HttpOnly cookie layers.
 */
export async function refreshAccessToken() {
  const res = await axios.post(
    `${BASE_URL}/auth/refresh/`,
    {}, // Body payload is empty because the cookie contains the token
    {
      withCredentials: true,
      headers: { Accept: "application/json" },
    },
  );

  const { access } = res.data;
  if (!access) {
    throw new Error(
      "Invalid token packet format payload structured structure.",
    );
  }

  setAccessToken(access);
  return access;
}

/**
 * 5. REQUEST PIPELINE INTERCEPTOR
 * Injects volatile bearer credentials into outgoing secure endpoints.
 */
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 6. RESPONSE PIPELINE INTERCEPTOR
 * Intercepts 401 Unauthorized errors to automatically initiate background session renewals
 * without interrupting the user's active workflow.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Filter validation conditions to prevent recursive authentication requests
    const isUnauthorized = error.response?.status === 401;
    const isRetryAlreadyTracked = originalRequest._retry;
    const isAuthEndpoint = originalRequest.url
      ? originalRequest.url.includes("/auth/")
      : false;

    if (isUnauthorized && !isRetryAlreadyTracked && !isAuthEndpoint) {
      // If a token refresh is already underway, queue this request to retry when it finishes
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
        const freshToken = await refreshAccessToken();
        processQueue(null, freshToken);
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // A 403 Forbidden status indicates either a malformed token profile or insufficient privileges
    if (error.response?.status === 403 && !isAuthEndpoint) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);

/**
 * 7. SESSION TIMEOUT CLEANUP UTILITY
 * Clears volatile state contexts and handles structured redirection back to the login gateway.
 */
export function handleSessionExpired() {
  setAccessToken(null);

  // Trigger context synchronization if AuthContext is mounted and listening
  if (
    typeof window !== "undefined" &&
    typeof window.__SMT_LOGOUT__ === "function"
  ) {
    window.__SMT_LOGOUT__();
    return;
  }

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login?reason=expired";
  }
}

export default api;
