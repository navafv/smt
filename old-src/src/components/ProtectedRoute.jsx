import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return <div className="p-8 text-center">Loading SMT Auth...</div>;

  // If no user is logged in, redirect to /login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
