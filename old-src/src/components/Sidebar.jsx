import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  LogOut,
  Store,
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
  Settings
} from "lucide-react";

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Store size={20} /> },
    { name: "Quick Sale", path: "/sale", icon: <ShoppingCart size={20} /> },
    { name: "Sales History", path: "/history", icon: <History size={20} /> },
    { name: "Stock Entry", path: "/add-purchase", icon: <Truck size={20} /> },
    {
      name: "Purchase History",
      path: "/purchases",
      icon: <ClipboardList size={20} />,
    },
    { name: "Customers", path: "/customers", icon: <Users size={20} /> },
    { name: "Suppliers", path: "/suppliers", icon: <Truck size={20} /> },
    {
      name: "Payment Logs",
      path: "/payments",
      icon: <ReceiptIndianRupee size={20} />,
    },
    { name: "Stock Status", path: "/stock", icon: <Box size={20} /> },
    { name: "Adjustments", path: "/returns", icon: <RotateCcw size={20} /> },
    { name: 'Loss Report', path: '/loss', icon: <TrendingDown size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <WalletCards size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileBarChart size={20} /> },
    { name: 'Export & Backup', path: '/export', icon: <Database size={20} /> },
    { name: 'Admin Panel', path: 'http://127.0.0.1:8000/admin/', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-white border-r border-gray-100 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 text-green-600">
          <Store size={32} strokeWidth={3} />
          <h1 className="text-2xl font-black tracking-tight">SMT FRUITS</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-green-50 text-green-600 shadow-xs"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="mb-4 px-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Admin
          </p>
          <p className="text-sm font-bold text-gray-700 truncate">
            {user?.username}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
