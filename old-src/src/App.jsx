import { Routes, Route, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login from "./Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Inventory from "./pages/Inventory";
import QuickSale from "./pages/QuickSale";
import SalesHistory from "./pages/SalesHistory";
import AddPurchase from "./pages/AddPurchase";
import PurchaseList from "./pages/PurchaseList";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import PaymentHistory from "./pages/PaymentHistory";
import Returns from "./pages/Returns";
import StockManagement from "./pages/StockManagement";
import LossReport from "./pages/LossReport";
import Expenses from "./pages/Expenses";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import ExportCenter from "./pages/ExportCenter";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sale" element={<QuickSale />} />
            <Route path="/history" element={<SalesHistory />} />
            <Route path="/add-purchase" element={<AddPurchase />} />
            <Route path="/purchases" element={<PurchaseList />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/loss" element={<LossReport />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/export" element={<ExportCenter />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
