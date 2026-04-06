import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Award,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color, loading }) => {
  if (loading)
    return <div className="h-32 animate-pulse rounded-[2.5rem] bg-slate-200" />;

  return (
    <div className="relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <h3
            className={`mt-2 text-3xl font-black tracking-tight ${color.text}`}
          >
            ₹{Number(value).toLocaleString("en-IN")}
          </h3>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.bg} ${color.text}`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`absolute -right-4 -bottom-4 h-16 w-16 opacity-5 ${color.text}`}
      >
        {icon}
      </div>
    </div>
  );
};

const PerformanceHeatmap = ({ data }) => {
  const getColor = (amount) => {
    if (amount > 10000) return "bg-emerald-600";
    if (amount > 5000) return "bg-emerald-400";
    if (amount > 0) return "bg-emerald-200";
    if (amount < 0) return "bg-rose-500";
    return "bg-slate-100";
  };

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Activity size={22} />
        </div>
        <h2 className="text-xl font-black text-slate-800">Profit Intensity</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {data?.map((day, i) => (
          <div
            key={i}
            title={`${day.date}: ₹${day.amount}`}
            className={`h-6 w-6 md:h-8 md:w-8 rounded-lg transition-all hover:scale-125 cursor-help ${getColor(day.amount)}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          Loss
        </span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div className="h-2 w-2 rounded-full bg-slate-100" />
          <div className="h-2 w-2 rounded-full bg-emerald-200" />
          <div className="h-2 w-2 rounded-full bg-emerald-600" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          High Profit
        </span>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/");
      setData(res.data);
    } catch {
      toast.error("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const colors = {
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
    blue: { text: "text-blue-600", bg: "bg-blue-50" },
    amber: { text: "text-amber-600", bg: "bg-amber-50" },
    rose: { text: "text-rose-600", bg: "bg-rose-50" },
  };

  return (
    <div className="space-y-8 p-4 md:p-0 pb-20">
      {/* --- HEADER --- */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            SMT Overview
          </h1>
          <p className="mt-1 font-bold text-slate-400">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm border border-slate-100 transition-all hover:text-emerald-600 active:rotate-180"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          loading={loading}
          title="Gross Sales"
          value={data?.today?.sales}
          icon={<TrendingUp />}
          color={colors.emerald}
        />
        <StatCard
          loading={loading}
          title="Inward Stock"
          value={data?.today?.purchases}
          icon={<ShoppingBag />}
          color={colors.blue}
        />
        <StatCard
          loading={loading}
          title="Daily Bills"
          value={
            Number(data?.today?.expenses || 0) +
            Number(data?.today?.wastage || 0)
          }
          icon={<TrendingDown />}
          color={colors.amber}
        />
        <StatCard
          loading={loading}
          title="Net Profit"
          value={data?.today?.profit}
          icon={<Wallet />}
          color={colors.emerald}
        />
      </div>

      {/* --- REVENUE TREND --- */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800">Revenue Stream</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            30-Day Performance History
          </p>
        </div>
        <div className="h-75 w-full">
          {loading ? (
            <div className="h-full w-full animate-pulse rounded-3xl bg-slate-50" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chart_data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    fontWeight: "900",
                  }}
                  cursor={{ stroke: "#10b981", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- HEATMAP & LISTS --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PerformanceHeatmap data={data?.chart_data} />

        {/* BEST SELLERS */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Award size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Best Sellers</h2>
          </div>
          <div className="space-y-3">
            {!loading &&
              data?.top_products?.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-400">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-700">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-slate-800">
                      {p.sold} {p.unit}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Volume Sold
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* STOCK ALERTS */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <AlertCircle size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Stock Alerts
              </h2>
            </div>
            <span className="rounded-full bg-rose-50 px-4 py-1 text-xs font-black text-rose-600">
              {data?.low_stock_count} Critical
            </span>
          </div>
          <div className="space-y-3">
            {!loading &&
              data?.low_stock?.map((p, i) => (
                <Link
                  to="/inventory"
                  key={i}
                  className="flex items-center justify-between rounded-2xl border-l-4 border-rose-500 bg-rose-50/30 p-4 transition-all hover:bg-rose-50/50"
                >
                  <span className="font-bold text-slate-800">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-600">
                      {p.stock} {p.unit} Left
                    </span>
                    <ArrowRight size={14} className="text-rose-300" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
