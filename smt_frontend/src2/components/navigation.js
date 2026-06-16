import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  ArchiveRestore,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Settings,
  Layers,
} from "lucide-react";

// Main navigation for bottom tab bar (5 items max for mobile - tightly focused)
export const bottomNavItems = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Sell", path: "/pos", icon: ShoppingCart },
  { label: "Stock", path: "/inventory", icon: Boxes },
  { label: "Sales", path: "/sales", icon: Receipt },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

const ADMIN_PANEL_URL = import.meta.env.VITE_ADMIN_URL || "#";

// Full navigation for drawer menu & desktop permanent sidebar
export const drawerNavItems = [
  {
    label: "Main Hub",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Quick Sale (POS)", path: "/pos", icon: ShoppingCart },
      { label: "Inventory Directory", path: "/inventory", icon: Boxes },
      { label: "Sales Logs", path: "/sales", icon: Receipt },
      { label: "Business Analytics", path: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Management Core",
    items: [
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Purchase Records", path: "/purchases", icon: ClipboardList },
      { label: "Log New Purchase", path: "/purchases/new", icon: PackagePlus },
      { label: "Live Stock Status", path: "/inventory/stock", icon: Layers },
      { label: "Expense Tracker", path: "/expenses", icon: Wallet },
    ],
  },
  {
    label: "System & Tools",
    items: [
      { label: "Payment Ledger", path: "/payments", icon: CreditCard },
      { label: "Returns & Claims", path: "/returns", icon: ArchiveRestore },
      { label: "Wastage & Loss", path: "/reports/loss", icon: AlertTriangle },
      { label: "Data Export Center", path: "/exports", icon: FileSpreadsheet },
      {
        label: "Admin Panel",
        path: ADMIN_PANEL_URL,
        icon: Settings,
        isExternal: ADMIN_PANEL_URL.startsWith("http"),
      },
    ],
  },
];

// Compatibility Layers
export const navSections = drawerNavItems;
export const mobilePrimaryNav = bottomNavItems;
