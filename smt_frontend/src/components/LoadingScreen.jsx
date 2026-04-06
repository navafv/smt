import React from "react";
import { Store, Loader2 } from "lucide-react";

/**
 * LoadingScreen Component
 * -----------------------
 * A high-fidelity, full-screen portal used for:
 * 1. Initial application boot (Auth check).
 * 2. Route transitions (Suspense).
 * 3. Critical process blocking.
 */
const LoadingScreen = ({ message = "Loading SMT System..." }) => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
      {/* Brand Container */}
      <div className="relative flex flex-col items-center">
        {/* Animated Outer Ring */}
        <div className="absolute -inset-4 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin opacity-20" />

        {/* Logo Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
          <Store size={40} className="animate-pulse" />
        </div>

        {/* Loading Text & Spinner */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin text-emerald-600" size={20} />
            <span className="text-sm font-black uppercase tracking-widest text-slate-800">
              Please Wait
            </span>
          </div>

          <p className="text-sm font-bold text-slate-400">{message}</p>
        </div>
      </div>

      {/* Progress Bar (Visual Only for feel) */}
      <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-slate-100">
        <div className="h-full w-1/3 animate-[loading_2s_infinite_ease-in-out] bg-emerald-600" />
      </div>

      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
