import { useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

// Polished, System-Synchronized Stat Card Component
function StatCard({ title, value, icon, loading, variant = "neutral" }) {
  const Icon = icon;

  if (loading) {
    return <LoadingSkeleton className="h-28 rounded-2xl" />;
  }

  // Adaptive contextual iconography background shades
  const variantStyles = {
    neutral: "bg-slate-50 text-slate-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-black text-slate-800 tracking-tight transition-transform duration-200 group-hover:translate-x-0.5">
            ₹{value?.toLocaleString("en-IN") || 0}
          </p>
        </div>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${variantStyles[variant]}`}
        >
          <Icon size={18} className="stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}

// Micro Alerts Card Architecture
function AlertCard({ title, description, type, ctaLabel, ctaTo }) {
  const colors = {
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    danger: "bg-rose-50/70 border-rose-200 text-rose-900",
    info: "bg-sky-50/70 border-sky-200 text-sky-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 shadow-xs ${colors[type]}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {description}
          </p>
        </div>
        <Link
          to={ctaTo}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 self-start sm:self-auto shadow-xs active:scale-95 transition-transform"
        >
          {ctaLabel} <ArrowRight size={12} className="stroke-[2.5]" />
        </Link>
      </div>
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
      toast.error("Dashboard failed to synchronize. Re-attempting connection.");
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

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Viewport Header Branding Layer */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Main Terminal
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Today's Store Metrics
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-all active:scale-95 shadow-xs disabled:opacity-50"
          aria-label="Refresh Dashboard Metrics Data"
        >
          <RefreshCw
            size={16}
            className={`stroke-[2.5] ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Grid: Responsive Columns (2 on mobile, 4 on desktop viewports) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          title="Net Profit"
          value={profit}
          icon={Wallet}
          variant={profit >= leakage ? "success" : "danger"}
        />
        <StatCard
          loading={loading}
          title="Gross Revenue"
          value={sales}
          icon={TrendingUp}
          variant="neutral"
        />
        <StatCard
          loading={loading}
          title="Total Leakage"
          value={leakage}
          icon={TrendingDown}
          variant={leakage > 0 ? "danger" : "neutral"}
        />
        <StatCard
          loading={loading}
          title="Purchases"
          value={purchases}
          icon={ShoppingBag}
          variant="neutral"
        />
      </div>

      {/* Dashboard Insights Container */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Alerts & Operational Insights
        </h2>

        <AlertCard
          title={
            profit >= leakage
              ? "✅ Net Profit Margin Stable"
              : "⚠️ Operation Leakage Discrepancy"
          }
          description={
            profit >= leakage
              ? "Your sales margins are successfully absorbing active shrinkage and store operational overhead costs today."
              : "Active wastage and overhead combined are currently draining out matching net product profitability margins."
          }
          type={profit >= leakage ? "success" : "danger"}
          ctaLabel="Audit Logs"
          ctaTo="/reports"
        />

        {data?.low_stock_count > 0 && (
          <AlertCard
            title={`📦 Low Inventory Stock Shortages (${data.low_stock_count})`}
            description="High-velocity store units are currently dropping under safe operational limits. Re-order items immediately."
            type="warning"
            ctaLabel="Restock Inventory"
            ctaTo="/inventory"
          />
        )}
      </div>

      {/* Analytics Splitting Layer: Top Performers & Low Stocks side-by-side on large viewport grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Fruit Products Segment */}
        <div className="card shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 fill-amber-500" />
              Velocity Run Leaders
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
              Today
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <LoadingSkeleton key={i} className="h-14 rounded-xl" />
                ))
            ) : data?.top_products?.length > 0 ? (
              data.top_products.slice(0, 5).map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-100 border border-slate-200/60 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {product.sold} {product.unit || "kg"} Distributed
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md tracking-wider">
                    High Velocity
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs font-medium text-slate-400 py-6">
                No client transaction data logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Items Segment */}
        <div className="card shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Depleting Inventory Units
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">
              Urgent Restock
            </span>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <LoadingSkeleton key={i} className="h-14 rounded-xl" />
                ))
            ) : data?.low_stock?.length > 0 ? (
              data.low_stock.slice(0, 5).map((product) => (
                <Link
                  key={product.name}
                  to="/inventory"
                  className="flex items-center justify-between p-3 border border-amber-100 bg-amber-50/40 hover:bg-amber-50 rounded-xl transition-all group"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-amber-700 mt-0.5">
                      Critical Margin: Only {product.stock}{" "}
                      {product.unit || "kg"} remaining
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-amber-500 transition-transform group-hover:translate-x-1 stroke-[2.5]"
                  />
                </Link>
              ))
            ) : (
              <p className="text-center text-xs font-medium text-slate-400 py-6">
                All stock parameters currently sit within safe limits.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
