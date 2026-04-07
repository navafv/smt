import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Simple Spinner */}
      <Loader2 className="animate-spin text-green-600" size={32} />

      {/* Loading Text */}
      <p className="text-sm text-gray-500 mt-3">{message}</p>
    </div>
  );
};

export default LoadingScreen;
