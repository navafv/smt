import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { Store, AlertOctagon, Home } from "lucide-react";
import { useAuth } from "./context/AuthContext"; // Centralized auth state

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import LoadingScreen from "./components/LoadingScreen";

// Lazy Load Pages for Performance
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

/**
 * Helper: Scroll To Top on Route Change
 * Ensures the user starts at the top of every new page.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App({ onMount }) {
  const { user } = useAuth(); // Use context instead of raw localStorage

  /**
   * Hook into the initial-loader removal logic from main.jsx.
   * This clears the pre-loader spinner once React hydrates.
   */
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  return (
    <>
      <ScrollToTop />

      {/* Suspense handles the loading state while lazy components fetch */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Business Logic Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />

              {/* Sales & Transactions */}
              <Route path="/sale" element={<QuickSale />} />
              <Route path="/history" element={<SalesHistory />} />

              {/* Inventory & Supply */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/stock" element={<StockManagement />} />
              <Route path="/add-purchase" element={<AddPurchase />} />
              <Route path="/purchases" element={<PurchaseList />} />

              {/* Financials & Adjustments */}
              <Route path="/payments" element={<PaymentHistory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/loss" element={<LossReport />} />

              {/* Partners */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/suppliers" element={<Suppliers />} />

              {/* Business Intelligence */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/export" element={<ExportCenter />} />
            </Route>
          </Route>

          {/* 404: Professional Catch-all */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-rose-50 text-rose-600">
                  <AlertOctagon size={40} />
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
                  404
                </h1>
                <p className="mt-2 text-lg font-bold text-slate-500">
                  The page you're looking for has moved or doesn't exist.
                </p>

                {/* Dynamic recovery based on session state */}
                <Link
                  to={user ? "/" : "/login"}
                  className="mt-8 flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-black text-white shadow-xl transition-all hover:bg-black active:scale-95"
                >
                  {user ? <Home size={20} /> : <Store size={20} />}
                  {user ? "RETURN TO DASHBOARD" : "RETURN TO LOGIN"}
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
