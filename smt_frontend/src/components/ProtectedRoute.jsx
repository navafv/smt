import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

/**
 * ProtectedRoute Component
 * ------------------------
 * Acts as a gatekeeper for private business routes.
 *
 * Features:
 * 1. Prevents "Flash of Unauthenticated Content" using the loading state.
 * 2. Persists the 'from' location to redirect users back after login.
 * 3. Uses the custom useAuth hook for cleaner code.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Handle the authentication check delay
  if (loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  // 2. If not authenticated, redirect to login
  // We pass the current 'location' in the 'state' prop.
  // This allows the Login page to redirect the user back here after success.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If authenticated, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
