import React from "react";

/**
 * PageHeader Layout Element
 * Standardized landing component that sets up viewport context boundaries,
 * title strings, and action triggers across application workspaces.
 */
export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-5 select-none animate-fade-in">
      {/* Structural Context Text Wrapper */}
      <div className="space-y-0.5 max-w-2xl">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {description}
          </p>
        )}
      </div>

      {/* Target Interaction Layout Node Anchor */}
      {action && (
        <div className="shrink-0 self-start sm:self-auto">{action}</div>
      )}
    </div>
  );
}
