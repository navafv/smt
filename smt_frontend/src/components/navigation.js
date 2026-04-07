import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  ArchiveRestore,
  FileSpreadsheet,
} from "lucide-react";

// Main navigation for bottom tab bar (5 items max for mobile)
export const bottomNavItems = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Sell", path: "/pos", icon: ShoppingCart },
  { label: "Stock", path: "/inventory", icon: Boxes },
  { label: "Sales", path: "/sales", icon: Receipt },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

// Full navigation for drawer menu
export const drawerNavItems = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Quick Sale", path: "/pos", icon: ShoppingCart },
      { label: "Inventory", path: "/inventory", icon: Boxes },
      { label: "Sales History", path: "/sales", icon: Receipt },
      { label: "Reports", path: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Purchases", path: "/purchases", icon: ClipboardList },
      { label: "Add Purchase", path: "/purchases/new", icon: PackagePlus },
      { label: "Expenses", path: "/expenses", icon: Wallet },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Payments", path: "/payments", icon: CreditCard },
      { label: "Returns", path: "/returns", icon: ArchiveRestore },
      { label: "Exports", path: "/exports", icon: FileSpreadsheet },
    ],
  },
];

// Keep old exports for compatibility (deprecated - use above instead)
export const navSections = drawerNavItems;
export const mobilePrimaryNav = bottomNavItems;
