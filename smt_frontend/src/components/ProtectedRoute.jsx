import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

/**
 * ProtectedRoute Guard Matrix
 * Intercepts unauthenticated resource requests and orchestrates
 * state-preserving historical relocation pipelines.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show systemic loading screen while inspecting credential token layers
  if (loading) {
    return <LoadingScreen />;
  }

  // Intercept unauthorized requests and redirect to auth workspace
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render authorized child routes inside a unified animated container pipeline
  return (
    <div className="min-h-screen bg-slate-50/50 animate-fade-in">
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
