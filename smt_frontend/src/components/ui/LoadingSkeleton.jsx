import React from "react";

/**
 * LoadingSkeleton Content Primitive
 * Renders an abstract layout placeholder element featuring a smooth animation loop.
 * Inherits dynamic size matrices from containing parent layout frameworks.
 */
export default function LoadingSkeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse w-full h-full rounded-xl bg-slate-200/70 transition-colors ${className}`.trim()}
    />
  );
}
