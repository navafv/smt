import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import LoadingScreen from "./components/LoadingScreen";

// Lazy Load Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const QuickSale = lazy(() => import("./pages/QuickSale"));
const SalesHistory = lazy(() => import("./pages/SalesHistory"));
const AddPurchase = lazy(() => import("./pages/AddPurchase"));
const PurchaseList = lazy(() => import("./pages/PurchaseList"));
const Customers = lazy(() => import("./pages/Customers"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const Returns = lazy(() => import("./pages/Returns"));
const StockManagement = lazy(() => import("./pages/StockManagement"));
const LossReport = lazy(() => import("./pages/LossReport"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Reports = lazy(() => import("./pages/Reports"));
const ExportCenter = lazy(() => import("./pages/ExportCenter"));
const Login = lazy(() => import("./Login"));

// Scroll to top instantly on route change to keep store workflow speedy
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Replaced 'smooth' with 'auto' for zero visual lag when changing screens
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function App({ onMount }) {
  const { user } = useAuth();

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  return (
    <>
      <ScrollToTop />
      {/* Fallback wrapped to prevent sudden structural page pops */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Core Features - Main Navigation */}
              <Route path="/pos" element={<QuickSale />} />
              <Route path="/sales" element={<SalesHistory />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />

              {/* Secondary Features */}
              <Route path="/inventory/stock" element={<StockManagement />} />
              <Route path="/purchases" element={<PurchaseList />} />
              <Route path="/purchases/new" element={<AddPurchase />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/payments" element={<PaymentHistory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/loss" element={<LossReport />} />
              <Route path="/exports" element={<ExportCenter />} />

              {/* Redirects for old URLs */}
              <Route path="/sale" element={<Navigate to="/pos" replace />} />
              <Route
                path="/history"
                element={<Navigate to="/sales" replace />}
              />
              <Route
                path="/stock"
                element={<Navigate to="/inventory/stock" replace />}
              />
              <Route
                path="/add-purchase"
                element={<Navigate to="/purchases/new" replace />}
              />
              <Route
                path="/loss"
                element={<Navigate to="/reports/loss" replace />}
              />
              <Route
                path="/export"
                element={<Navigate to="/exports" replace />}
              />
            </Route>
          </Route>

          {/* 404 Page - Polished System Theme Aesthetics */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
                  <svg
                    className="w-10 h-10 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  404
                </h1>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Page Not Found
                </h2>
                <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
                  The screen or feature you are trying to access doesn't exist
                  or may have shifted locations.
                </p>
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
                >
                  Return to Control Panel
                </Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
