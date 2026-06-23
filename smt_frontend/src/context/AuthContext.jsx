import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import api, { refreshAccessToken, setAccessToken, warmUpBackend } from "../api";
import LoadingScreen from "../components/LoadingScreen";

const AuthContext = createContext(null);
const REFRESH_BUFFER_MS = 60_000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use references to prevent stale closures within event listeners and timeouts
  const refreshTimeoutRef = useRef(null);
  const tokenRef = useRef(null);
  tokenRef.current = token;

  // Clear any existing scheduled execution frames safely
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Public logout routine to flush memory allocations and tokens
  const logout = useCallback(
    async ({ redirect = true, silent = false, reason = null } = {}) => {
      clearRefreshTimeout();
      try {
        // Informs backend to blacklist token and flush cookies
        await api.post("/auth/logout/");
      } catch {
        // Best-effort logout cleanup on server; silent catch to guarantee frontend state clears
      } finally {
        setToken(null);
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("smt_has_session");

        if (!silent) {
          if (reason === "expired") {
            toast.error("Session expired for security. Please log back in.", {
              id: "session-expired-toast", // Deduplicates stacked toast views
              duration: 5000,
            });
          } else {
            toast.success("Logged out securely.");
          }
        }

        if (redirect) {
          navigate(reason ? `/login?reason=${reason}` : "/login", {
            replace: true,
          });
        }
      }
    },
    [clearRefreshTimeout, navigate],
  );

  // Proactively requests a new access token using the HttpOnly refresh cookie
  const performTokenRefresh = useCallback(async () => {
    try {
      const newToken = await refreshAccessToken();
      const decoded = jwtDecode(newToken);

      setToken(newToken);
      setAccessToken(newToken);
      setUser(decoded);

      // Schedule the next auto-refresh cascade sequence
      scheduleRefresh(newToken);
      return newToken;
    } catch (error) {
      // Failing to refresh implies an expired or blacklisted cookie session state
      if (!window.navigator.onLine) {
        toast.error("Network connection unstable. Retrying connection...", {
          id: "net-retry",
        });
        // Optional: you could implement a retry-backoff here instead of logging out
      } else {
        await logout({ redirect: true, silent: false, reason: "expired" });
      }
      return null;
    }
  }, [logout]); // Removed scheduleRefresh from dependency array to prevent circular dependency warnings if it's hoisted

  // Calculates remaining token validity lifespan and schedules a standard macro task
  const scheduleRefresh = useCallback(
    (accessToken) => {
      clearRefreshTimeout();
      if (!accessToken) return;

      try {
        const decoded = jwtDecode(accessToken);
        // Calculate delay in ms, subtracting the buffer
        const delay = Math.max(
          decoded.exp * 1000 - Date.now() - REFRESH_BUFFER_MS,
          0,
        );

        if (delay > 0) {
          refreshTimeoutRef.current = window.setTimeout(() => {
            performTokenRefresh();
          }, delay);
        } else {
          // If buffer window is already breached, refresh immediately
          performTokenRefresh();
        }
      } catch {
        logout({ redirect: true, silent: false, reason: "expired" });
      }
    },
    [clearRefreshTimeout, performTokenRefresh, logout],
  );

  const setupUserFromToken = useCallback(
    (accessToken) => {
      const decoded = jwtDecode(accessToken);
      setToken(accessToken);
      setAccessToken(accessToken);
      setUser(decoded);
      scheduleRefresh(accessToken);
      return decoded;
    },
    [scheduleRefresh],
  );

  // Synchronous evaluator for foreground tab synchronization loops
  const syncTabVisibility = useCallback(() => {
    if (document.visibilityState === "visible" && tokenRef.current) {
      try {
        const decoded = jwtDecode(tokenRef.current);
        const currentTime = Date.now();

        // CRITICAL FIX: If tab throttling paused JavaScript execution and the token
        // is now close to expiration or dead, force an immediate proactive refresh.
        if (decoded.exp * 1000 - currentTime <= REFRESH_BUFFER_MS) {
          performTokenRefresh();
        } else {
          // Re-synchronize normal macro timing queues if token is still valid
          scheduleRefresh(tokenRef.current);
        }
      } catch {
        logout({ redirect: true, silent: false, reason: "expired" });
      }
    }
  }, [performTokenRefresh, scheduleRefresh, logout]);

  // Bootstraps initialization and monitors visibility api cycles
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const hasSession = localStorage.getItem("smt_has_session");

      if (!hasSession) {
        setLoading(false);
        return;
      }

      try {
        await warmUpBackend();
        const initialToken = await refreshAccessToken();
        if (!cancelled && initialToken) {
          setupUserFromToken(initialToken);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Auth initialization failed:", error);
        }
        if (!cancelled) {
          setToken(null);
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Attach listeners to neutralize mobile background sleep execution models
    document.addEventListener("visibilitychange", syncTabVisibility);

    return () => {
      cancelled = true;
      clearRefreshTimeout();
      document.removeEventListener("visibilitychange", syncTabVisibility);
    };
  }, [clearRefreshTimeout, syncTabVisibility, setupUserFromToken]);

  // Handle global interceptor logouts safely with explicit UX notification feedback
  useEffect(() => {
    window.__SMT_LOGOUT__ = async () => {
      await logout({ redirect: true, silent: false, reason: "expired" });
    };
    return () => {
      delete window.__SMT_LOGOUT__;
    };
  }, [logout]);

  // Public login routine exposed to forms
  const login = async (username, password, redirectTo = "/dashboard") => {
    const cleanName = username.charAt(0).toUpperCase() + username.slice(1);

    try {
      const res = await api.post("/auth/login/", { username, password });
      setupUserFromToken(res.data.access);
      toast.success(`Welcome back, Operator ${cleanName}!`);
      localStorage.setItem("smt_has_session", "true");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Access denied. Please check your system credentials.";
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout: () => logout({ redirect: true, silent: false }),
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* UX Optimization: Swap hard unmounted blank states for a premium, stylized full preloader */}
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
