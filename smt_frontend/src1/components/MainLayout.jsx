import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  History,
  Truck,
  ClipboardList,
  Users,
  ReceiptIndianRupee,
  Box,
  RotateCcw,
  TrendingDown,
  WalletCards,
  FileBarChart,
  Database,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

/**
 * Navigation Schema
 * Categorized for better cognitive load management on desktop.
 */
const navGroups = [
  {
    label: "Core Operations",
    items: [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
      {
        name: "Quick Sale",
        path: "/sale",
        icon: <ShoppingCart size={18} />,
        isPrimary: true,
      },
      { name: "Inventory", path: "/inventory", icon: <Store size={18} /> },
    ],
  },
  {
    label: "Stock & Logistics",
    items: [
      { name: "Stock Entry", path: "/add-purchase", icon: <Truck size={18} /> },
      { name: "Stock Status", path: "/stock", icon: <Box size={18} /> },
      {
        name: "Purchase History",
        path: "/purchases",
        icon: <ClipboardList size={18} />,
      },
      { name: "Adjustments", path: "/returns", icon: <RotateCcw size={18} /> },
    ],
  },
  {
    label: "Contacts & Payments",
    items: [
      { name: "Customers", path: "/customers", icon: <Users size={18} /> },
      { name: "Suppliers", path: "/suppliers", icon: <Truck size={18} /> },
      {
        name: "Payment Logs",
        path: "/payments",
        icon: <ReceiptIndianRupee size={18} />,
      },
      { name: "Sales History", path: "/history", icon: <History size={18} /> },
    ],
  },
  {
    label: "Reports & Admin",
    items: [
      { name: "Expenses", path: "/expenses", icon: <WalletCards size={18} /> },
      { name: "Loss Report", path: "/loss", icon: <TrendingDown size={18} /> },
      { name: "Reports", path: "/reports", icon: <FileBarChart size={18} /> },
      {
        name: "Export & Backup",
        path: "/export",
        icon: <Database size={18} />,
      },
      { name: "Admin Panel", path: "https://smt-project.onrender.com/admin", icon: <Settings size={18} /> },
    ],
  },
];

const MainLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Shared NavItem Component for Desktop/Mobile Drawer
  const NavLinkItem = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setIsDrawerOpen(false)}
      className={`group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
        isActive(item.path)
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`${isActive(item.path) ? "text-white" : "text-slate-400 group-hover:text-emerald-600"}`}
        >
          {item.icon}
        </span>
        {item.name}
      </div>
      {isActive(item.path) && <ChevronRight size={14} />}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen lg:flex">
        <div className="flex items-center gap-3 p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Store size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">
            SMT FRUITS
          </span>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto px-6 pb-6 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLinkItem key={item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-6">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Logout Session
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col">
        {/* MOBILE TOP HEADER */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md lg:hidden">
          <span className="text-xl font-black text-emerald-600">SMT</span>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-lg bg-slate-100 p-2 text-slate-600"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 pb-32 md:p-8 lg:pb-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAV --- */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-6 py-3 pb-safe lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 ${isActive("/") ? "text-emerald-600" : "text-slate-400"}`}
            >
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link
              to="/inventory"
              className={`flex flex-col items-center gap-1 ${isActive("/inventory") ? "text-emerald-600" : "text-slate-400"}`}
            >
              <Store size={20} />
              <span className="text-[10px] font-bold">Items</span>
            </Link>

            {/* Action FAB */}
            <Link to="/sale" className="relative -top-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 ring-4 ring-white transition-transform active:scale-90">
                <ShoppingCart size={24} />
              </div>
            </Link>

            <Link
              to="/customers"
              className={`flex flex-col items-center gap-1 ${isActive("/customers") ? "text-emerald-600" : "text-slate-400"}`}
            >
              <Users size={20} />
              <span className="text-[10px] font-bold">Clients</span>
            </Link>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-center gap-1 text-slate-400"
            >
              <Menu size={20} />
              <span className="text-[10px] font-bold">Menu</span>
            </button>
          </div>
        </nav>
      </div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-60 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="relative w-4/5 max-w-xs bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Menu Navigation
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto h-[calc(100vh-120px)] pr-2">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  {group.items.map((item) => (
                    <NavLinkItem key={item.path} item={item} />
                  ))}
                </div>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 bg-red-50 mt-4"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
