import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingScreen - High-fidelity system loader
 * @param {string} message - Custom placeholder subtext
 * @param {boolean} fullScreen - True if hijacking the whole browser window, false if rendering inline inside a page layout card
 */
const LoadingScreen = ({
  message = "Processing data...",
  fullScreen = true,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
        fullScreen
          ? "fixed inset-0 bg-slate-50 z-50" // Matched to application core background layer
          : "w-full h-64 bg-transparent rounded-2xl" // Responsive inner layout injection behavior
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle, premium glowing ring element */}
        <div className="absolute w-10 h-10 bg-emerald-500/10 rounded-full blur-md animate-pulse" />

        {/* System Spinner - Adjusted easing to match native desktop apps */}
        <Loader2
          className="text-emerald-600 animate-spin ease-in-out"
          size={36}
          style={{ animationDuration: "0.85s" }}
        />
      </div>

      {/* Loading Context Text */}
      <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mt-4 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingScreen;
