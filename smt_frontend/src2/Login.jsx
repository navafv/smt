import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { warmUpBackend } from "./api";
import { Store, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const queryParams = new URLSearchParams(location.search);
  const isSessionExpired = queryParams.get("reason") === "expired";

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  // Show explicit session expired notifications cleanly via unique toast identification matching
  useEffect(() => {
    if (isSessionExpired) {
      toast.error("Session expired for security. Please log back in.", {
        id: "session-expired-toast",
      });
    }
  }, [isSessionExpired]);

  useEffect(() => {
    warmUpBackend();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCreds((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(creds.username, creds.password, from);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md">
        {/* Logo & Brand Architecture */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/10 border border-emerald-500/10">
            <Store size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            SMT Fruits
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Shop Management System
          </p>
        </div>

        {/* Secure Authorization Form Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Username Identifier
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="username"
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter shop account id"
                  autoComplete="username"
                  className="input pl-11"
                  value={creds.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Security Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter access code"
                  autoComplete="current-password"
                  className="input pl-11 pr-12"
                  value={creds.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  tabIndex={-1} // Bypasses keyboard focus jumping trap during checkout data entries
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Adaptive Platform Submit Processing Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3.5 font-bold tracking-wide mt-6 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
        </div>

        {/* Base Platform Compliance Footers */}
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-6 animate-pulse">
          Secure Multi-Tenant Ledger Gateway
        </p>
      </div>
    </div>
  );
}
