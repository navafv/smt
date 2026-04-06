import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: Decode and set user state safely
  const handleTokenSetup = useCallback((accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      // Senior Move: Check if token is actually expired before setting user
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        logout();
        return null;
      }

      setUser(decoded);
      return decoded;
    } catch (error) {
      console.error("Invalid token format:", error);
      logout();
      return null;
    }
  }, []);

  useEffect(() => {
    // Auto-restore session on mount
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        handleTokenSetup(token);
      }
      setLoading(false);
    };
    initAuth();
  }, [handleTokenSetup]);

  const login = async (username, password) => {
    try {
      const res = await api.post("/auth/login/", { username, password });

      const { access, refresh } = res.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      handleTokenSetup(access);
      toast.success(`Welcome back, ${username}!`);
      navigate("/"); // Centralized navigation after login
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      toast.error(message);
      throw error; // Re-throw so the Login component can handle UI states (like loading spinners)
    }
  };

  const logout = useCallback(() => {
    // Pro Tip: Don't just clear everything (you might have UI preferences saved)
    // Only remove auth-related keys
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
    toast.success("Logged out successfully.");
    navigate("/login");
  }, [navigate]);

  // Context Value
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

// Custom Hook: The industry standard way to consume context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
