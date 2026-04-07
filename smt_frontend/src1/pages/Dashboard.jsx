import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { formatWeekdayDateIST } from "../utils/datetime";

const StatCard = ({ title, value, helper, icon, accent, loading }) => {
  if (loading) {
    return <div className="h-36 animate-pulse rounded-4xl bg-slate-200" />;
  }

  return (
    <div className="smt-kpi">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h3 className={`mt-3 text-3xl font-black tracking-tight ${accent}`}>
            ₹ {Number(value || 0).toLocaleString("en-IN")}
          </h3>
          <p className="mt-3 text-sm font-semibold text-slate-500">{helper}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

const MetricTile = ({ label, value, accent }) => (
  <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4">
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
      {label}
    </p>
    <p className={`mt-2 text-2xl font-black tracking-tight ${accent}`}>₹ {value}</p>
  </div>
);

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

  const todayBreakdown = useMemo(
    () => [
      {
        label: "Profit",
        value: Number(data?.today?.profit || 0),
        color: "#059669",
      },
      {
        label: "Expenses",
        value: Number(data?.today?.expenses || 0),
        color: "#f59e0b",
      },
      {
        label: "Wastage",
        value: Number(data?.today?.wastage || 0),
        color: "#e11d48",
      },
    ],
    [data],
  );

  const actionCards = useMemo(
    () => [
      {
        title: "Profit vs Leakages",
        body:
          Number(data?.today?.profit || 0) >=
          Number(data?.today?.wastage || 0) + Number(data?.today?.expenses || 0)
            ? "Profit is covering today's costs. Keep stock tight and push best sellers."
            : "Leakages are eating into margin. Review wastage and expense entries first.",
        tone:
          Number(data?.today?.profit || 0) >=
          Number(data?.today?.wastage || 0) + Number(data?.today?.expenses || 0)
            ? "border-emerald-100 bg-emerald-50"
            : "border-rose-100 bg-rose-50",
      },
      {
        title: "Stock Watch",
        body:
          Number(data?.low_stock_count || 0) > 0
            ? `${data?.low_stock_count} products need replenishment soon.`
            : "No critical stock issues right now.",
        tone:
          Number(data?.low_stock_count || 0) > 0
            ? "border-amber-100 bg-amber-50"
            : "border-slate-200 bg-slate-50",
      },
    ],
    [data],
  );

  return (
    <div className="space-y-8 p-4 pb-20 md:p-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold tracking-wide text-emerald-600">
            Retail Control Center
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Today&apos;s Store Pulse
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {formatWeekdayDateIST()} . Focus on profit, stock risk, and leakage.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          aria-label="Refresh dashboard data"
          className="smt-icon-button"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          loading={loading}
          title="Net Profit"
          value={data?.today?.profit}
          helper="First number the owner should check."
          icon={<Wallet />}
          accent="text-emerald-600"
        />
        <StatCard
          loading={loading}
          title="Gross Sales"
          value={data?.today?.sales}
          helper="How much cash moved through the counter."
          icon={<TrendingUp />}
          accent="text-slate-900"
        />
        <StatCard
          loading={loading}
          title="Leakages"
          value={Number(data?.today?.expenses || 0) + Number(data?.today?.wastage || 0)}
          helper="Combined impact of expenses and wastage."
          icon={<TrendingDown />}
          accent="text-rose-600"
        />
        <StatCard
          loading={loading}
          title="Inward Stock"
          value={data?.today?.purchases}
          helper="Fresh stock value added to inventory."
          icon={<ShoppingBag />}
          accent="text-blue-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <section className="smt-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Net Outcome Trend
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                30-day line of daily performance, useful for spotting weak days fast.
              </p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Daily net amount
            </p>
          </div>

          <div className="mt-6 h-80 w-full min-w-0">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-[1.75rem] bg-slate-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chart_data}>
                  <defs>
                    <linearGradient id="dashboardProfitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    tickFormatter={(value) => `₹ ${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹ ${value}`, "Net Amount"]}
                    contentStyle={{
                      borderRadius: "18px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#dashboardProfitFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="smt-card">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Today&apos;s Margin Drivers
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Shows whether the day is healthy because of profit or being dragged by losses.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetricTile
              label="Profit"
              value={Number(data?.today?.profit || 0).toLocaleString("en-IN")}
              accent="text-emerald-600"
            />
            <MetricTile
              label="Expenses"
              value={Number(data?.today?.expenses || 0).toLocaleString("en-IN")}
              accent="text-amber-600"
            />
            <MetricTile
              label="Wastage"
              value={Number(data?.today?.wastage || 0).toLocaleString("en-IN")}
              accent="text-rose-600"
            />
          </div>

          <div className="mt-6 h-55 w-full min-w-0">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-[1.75rem] bg-slate-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayBreakdown} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }}
                    width={80}
                  />
                  <Tooltip formatter={(value) => [`₹ ${value}`, "Amount"]} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {todayBreakdown.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,1fr)]">
        <section className="smt-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Best Sellers</h2>
              <p className="text-sm font-semibold text-slate-500">
                Items carrying today&apos;s volume.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!loading &&
              data?.top_products?.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-3xl bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-black text-slate-900">{product.name}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        {product.sold} {product.unit} sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="smt-card">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Stock Alerts</h2>
                <p className="text-sm font-semibold text-slate-500">
                  Reorder before these items interrupt sales.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600">
              {data?.low_stock_count || 0} Critical
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {!loading &&
              data?.low_stock?.map((product) => (
                <Link
                  to="/inventory"
                  key={product.name}
                  className="flex items-center justify-between rounded-3xl border border-rose-100 bg-rose-50/70 p-4 transition-all hover:bg-rose-50"
                >
                  <div>
                    <p className="font-black text-slate-900">{product.name}</p>
                    <p className="text-sm font-semibold text-rose-700">
                      {product.stock} {product.unit} left
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-rose-400" />
                </Link>
              ))}
          </div>
        </section>

        <section className="space-y-4">
          {actionCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-4xl border p-6 ${card.tone}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Priority Note
              </p>
              <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">
                {card.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                {card.body}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
