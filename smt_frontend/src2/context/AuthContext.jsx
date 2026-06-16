import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import api, { refreshAccessToken, setAccessToken, warmUpBackend } from "../api";
import LoadingScreen from "../components/LoadingScreen";

const AuthContext = createContext();
const REFRESH_BUFFER_MS = 60_000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(
    async ({ redirect = true, silent = false, reason = null } = {}) => {
      clearRefreshTimer();
      try {
        await api.post("/auth/logout/");
      } catch {
        // Best-effort logout cleanup on server
      }

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
    },
    [clearRefreshTimer, navigate],
  );

  const scheduleRefresh = useCallback(
    (accessToken) => {
      clearRefreshTimer();
      try {
        const decoded = jwtDecode(accessToken);
        const delay = Math.max(
          decoded.exp * 1000 - Date.now() - REFRESH_BUFFER_MS,
          0,
        );

        refreshTimerRef.current = window.setTimeout(async () => {
          try {
            const token = await refreshAccessToken();
            const refreshedUser = jwtDecode(token);
            setAccessToken(token);
            setUser(refreshedUser);
            scheduleRefresh(token);
          } catch (err) {
            // Check if failure is due to a network offline state or an invalid token
            if (!window.navigator.onLine) {
              // Retry mechanism if store internet drops temporarily
              toast.error(
                "Network connection unstable. Retrying connection...",
                { id: "net-retry" },
              );
              setTimeout(() => scheduleRefresh(accessToken), 10000);
            } else {
              await logout({
                redirect: true,
                silent: false,
                reason: "expired",
              });
            }
          }
        }, delay);
      } catch {
        logout({ redirect: true, silent: false, reason: "expired" });
      }
    },
    [clearRefreshTimer, logout],
  );

  const setupUserFromToken = useCallback(
    (accessToken) => {
      const decoded = jwtDecode(accessToken);
      setAccessToken(accessToken);
      setUser(decoded);
      scheduleRefresh(accessToken);
      return decoded;
    },
    [scheduleRefresh],
  );

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
        const token = await refreshAccessToken();
        if (!cancelled) {
          setupUserFromToken(token);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Auth initialization failed:", error);
        }
        if (!cancelled) {
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

    return () => {
      cancelled = true;
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, setupUserFromToken]);

  // Handle global interceptor logouts safely with explicit UX notification feedback
  useEffect(() => {
    window.__SMT_LOGOUT__ = async () => {
      await logout({ redirect: true, silent: false, reason: "expired" });
    };
    return () => {
      delete window.__SMT_LOGOUT__;
    };
  }, [logout]);

  const login = async (username, password, redirectTo = "/dashboard") => {
    // Capitalize user styling natively for standard notification layouts
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
