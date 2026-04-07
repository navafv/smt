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

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          {/* 404 Page - Mobile Friendly */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-red-500"
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600 text-center mb-8">Page not found</p>
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform inline-block"
                >
                  Go Home
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
