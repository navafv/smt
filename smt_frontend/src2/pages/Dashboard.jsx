import { useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

// Simple Stat Card Component
function StatCard({ title, value, icon, loading }) {
  const Icon = icon;

  if (loading) {
    return <LoadingSkeleton className="h-28" />;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{value?.toLocaleString() || 0}
          </p>
        </div>
        <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
          <Icon size={20} className="text-green-600" />
        </div>
      </div>
    </div>
  );
}

// Simple Quick Action Button
function QuickAction({ label, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors"
    >
      <span className="font-medium text-gray-900">{label}</span>
      <ArrowRight size={18} className="text-gray-400" />
    </Link>
  );
}

// Simple Alert Card
function AlertCard({ title, description, type, ctaLabel, ctaTo }) {
  const colors = {
    warning: "bg-amber-50 border-amber-100",
    danger: "bg-red-50 border-red-100",
    info: "bg-blue-50 border-blue-100",
    success: "bg-green-50 border-green-100",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[type]}`}>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <Link
        to={ctaTo}
        className="text-sm font-medium text-gray-900 inline-flex items-center gap-1"
      >
        {ctaLabel} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/");
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const profit = data?.today?.profit || 0;
  const expenses = data?.today?.expenses || 0;
  const wastage = data?.today?.wastage || 0;
  const sales = data?.today?.sales || 0;
  const purchases = data?.today?.purchases || 0;
  const leakage = expenses + wastage;

  const quickActions = [
    { label: "Quick Sale", to: "/pos" },
    { label: "Inventory", to: "/inventory" },
    { label: "Sales History", to: "/sales" },
    { label: "Reports", to: "/reports" },
  ];

  return (
    <div className="space-y-5 pb-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Today's overview</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          loading={loading}
          title="Net Profit"
          value={profit}
          icon={Wallet}
        />
        <StatCard
          loading={loading}
          title="Gross Sales"
          value={sales}
          icon={TrendingUp}
        />
        <StatCard
          loading={loading}
          title="Leakage"
          value={leakage}
          icon={TrendingDown}
        />
        <StatCard
          loading={loading}
          title="Purchases"
          value={purchases}
          icon={ShoppingBag}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <QuickAction key={action.to} {...action} />
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 px-1">Alerts & Insights</h2>

        {/* Profit Alert */}
        <AlertCard
          title={
            profit >= leakage ? "✅ Profit holding strong" : "⚠️ Leakage alert"
          }
          description={
            profit >= leakage
              ? "Sales are covering today's wastage and expenses."
              : "Expenses + wastage are exceeding profit. Review your costs."
          }
          type={profit >= leakage ? "success" : "danger"}
          ctaLabel="View Reports"
          ctaTo="/reports"
        />

        {/* Stock Alert */}
        <AlertCard
          title={
            data?.low_stock_count > 0
              ? `📦 ${data?.low_stock_count} items low in stock`
              : "✅ Stock levels healthy"
          }
          description={
            data?.low_stock_count > 0
              ? "Some items need replenishment soon."
              : "All inventory levels are within safe limits."
          }
          type={data?.low_stock_count > 0 ? "warning" : "success"}
          ctaLabel="Check Inventory"
          ctaTo="/inventory"
        />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Top Selling</h2>
          <span className="text-xs text-gray-500">Today</span>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array(3)
              .fill()
              .map((_, i) => <LoadingSkeleton key={i} className="h-16" />)
          ) : data?.top_products?.length > 0 ? (
            data.top_products.slice(0, 5).map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.sold} {product.unit} sold
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600">Top</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No sales data yet</p>
          )}
        </div>
      </div>

      {/* Low Stock Items */}
      {data?.low_stock?.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
          <div className="space-y-3">
            {data.low_stock.slice(0, 3).map((product) => (
              <Link
                key={product.name}
                to="/inventory"
                className="flex items-center justify-between p-3 bg-amber-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-amber-700">
                    {product.stock} {product.unit} remaining
                  </p>
                </div>
                <ArrowRight size={16} className="text-amber-500" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
