import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu, Store, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { bottomNavItems, drawerNavItems } from "./navigation";

function SidebarLink({ item, onNavigate, pathname }) {
  const Icon = item.icon;
  const isActive =
    pathname === item.path || pathname.startsWith(`${item.path}/`);

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
        isActive
          ? "bg-green-50 text-green-700"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </div>
    </NavLink>
  );
}

export default function MainLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">SMT Fruits</h1>
              <p className="text-xs text-gray-500">Shop Management</p>
            </div>
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-2 py-2">
        <div className="flex items-center justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 active:bg-gray-50"
                }`}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close menu"
          />

          <aside className="absolute right-0 top-0 flex h-full w-80 flex-col bg-white shadow-xl">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Logged in as</p>
                  <p className="font-bold text-gray-900">
                    {user?.username || user?.name || "Store Operator"}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              {drawerNavItems.map((section) => (
                <div key={section.label}>
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
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

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => logout()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-medium text-red-600 transition-colors active:bg-red-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
