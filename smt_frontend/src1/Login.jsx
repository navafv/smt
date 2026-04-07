import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {
  Store,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect calculation: where was the user trying to go?
  const from = location.state?.from?.pathname || "/";
  const queryParams = new URLSearchParams(location.search);
  const isSessionExpired = queryParams.get("session") === "expired";

  // 1. Guard: Redirect authenticated users away from login
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  // 2. Alert: Handle external triggers (like Axios interceptors)
  useEffect(() => {
    if (isSessionExpired) {
      toast.error("Session expired. Please re-authenticate.", {
        id: "auth-exp",
      });
    }
  }, [isSessionExpired]);

  // 3. Optimized Change Handler
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
      // Backend errors are surfaced by AuthContext.
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 selection:bg-emerald-100">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Branding Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-4xl bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
            <Store size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800">
            SMT FRUITS
          </h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            Secure Terminal Access
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/60">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Operator ID
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter username"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  value={creds.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Access Key
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-11 pr-12 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  value={creds.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-tighter text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Online: SMT-OS
          </div>
        </div>
      </div>
    </div>
  );
}
