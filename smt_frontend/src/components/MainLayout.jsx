import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu, Store, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { bottomNavItems, drawerNavItems } from "./navigation";

function SidebarLink({ item, onNavigate, pathname }) {
  const Icon = item.icon;
  const isActive =
    pathname === item.path;

  if (item.isExternal) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-slate-500" />
          <span className="text-sm">{item.label}</span>
        </div>
      </a>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
        isActive
          ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm"
          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 active:scale-[0.99]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={isActive ? "text-emerald-600" : "text-slate-500"}
        />
        <span className="text-sm">{item.label}</span>
      </div>
    </NavLink>
  );
}

export default function MainLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. DESKTOP PERMANENT SIDEBAR CONTAINER */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 flex-col bg-white border-r border-slate-200/80 z-40">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/10">
            <Store size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">
              SMT Fruits
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Shop Management
            </p>
          </div>
        </div>

        {/* Desktop Navigation Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {drawerNavItems.map((section) => (
            <div key={section.label}>
              <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    pathname={location.pathname}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold uppercase">
              {(user?.username || user?.name || "OP").substring(0, 2)}
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-400 font-medium leading-none mb-1">
                Operator
              </p>
              <p className="text-sm font-bold text-slate-800 truncate leading-none">
                {user?.username || user?.name || "Store Operator"}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/50 py-2.5 text-xs font-bold text-rose-600 transition-all active:scale-[0.98]"
          >
            <LogOut size={14} />
            Exit Platform
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE APEX WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Mobile View Top Header Bar */}
        <header className="sticky top-0 z-30 lg:hidden border-b border-slate-100 bg-white px-4 py-3 shadow-sm shadow-slate-100/50">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                <Store size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 tracking-tight">
                  SMT Fruits
                </h1>
                <p className="text-[10px] font-medium text-slate-400">
                  Shop Management
                </p>
              </div>
            </Link>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 transition-transform"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={20} className="text-slate-700" />
            </button>
          </div>
        </header>

        {/* Global Page Injection Slot */}
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 pb-24 lg:pb-6 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mobile Screen Bottom Tab Menu Bar */}
        <nav className="safe-bottom lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 bg-white/95 backdrop-blur-md px-2 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-around max-w-xl mx-auto">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-all active:scale-90 ${
                    isActive
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-emerald-600" : "text-slate-400"}
                  />
                  <span className="text-[10px] tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 3. MOBILE SYSTEM SLIDEOUT DRAWER MENU PANEL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Shadow Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          <aside className="absolute right-0 top-0 bottom-0 flex h-full w-72 flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="border-b border-slate-100 p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Active Account
                  </p>
                  <p className="font-bold text-slate-800 text-base">
                    {user?.username || user?.name || "Store Operator"}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/60 text-slate-700 hover:bg-slate-200 active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Scroll Area */}
            <div className="flex-1 space-y-6 overflow-y-auto p-4 custom-scrollbar">
              {drawerNavItems.map((section) => (
                <div key={section.label}>
                  <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.label}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <SidebarLink
                        key={item.path}
                        item={item}
                        pathname={location.pathname}
                        onNavigate={() => setIsDrawerOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Drawer Logout Panel */}
            <div className="border-t border-slate-100 p-4">
              <button
                onClick={() => logout()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 py-3 text-sm font-bold text-rose-600 transition-colors active:scale-[0.99]"
              >
                <LogOut size={16} />
                Log Out of System
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
