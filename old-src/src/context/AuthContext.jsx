import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto Session Restore
    const token = localStorage.getItem("access_token");
    if (token) {
      setUser(jwtDecode(token));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    setUser(jwtDecode(res.data.access));
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
