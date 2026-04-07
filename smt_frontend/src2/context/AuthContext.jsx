/* eslint-disable react-refresh/only-export-components */
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
import api, {
  refreshAccessToken,
  setAccessToken,
  warmUpBackend,
} from "../api";

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
    async ({ redirect = true, silent = false } = {}) => {
      clearRefreshTimer();
      try {
        await api.post("/auth/logout/");
      } catch {
        // Best-effort logout is enough here; local cleanup still proceeds.
      }

      setAccessToken(null);
      setUser(null);

      if (!silent) {
        toast.success("Logged out successfully.");
      }

      if (redirect) {
        navigate("/login");
      }

      localStorage.removeItem("smt_has_session");
    },
    [clearRefreshTimer, navigate],
  );

  const scheduleRefresh = useCallback(
    (accessToken) => {
      clearRefreshTimer();
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
        } catch {
          await logout({ redirect: true, silent: true });
        }
      }, delay);
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

  useEffect(() => {
    window.__SMT_LOGOUT__ = async () => {
      clearRefreshTimer();
      setAccessToken(null);
      setUser(null);
      navigate("/login?session=expired");
    };
    return () => {
      delete window.__SMT_LOGOUT__;
    };
  }, [clearRefreshTimer, navigate]);

  const login = async (username, password, redirectTo = "/dashboard") => {
    try {
      const res = await api.post("/auth/login/", { username, password });
      setupUserFromToken(res.data.access);
      toast.success(`Welcome back, ${username}!`);
      navigate(redirectTo, { replace: true });
      localStorage.setItem("smt_has_session", "true");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
