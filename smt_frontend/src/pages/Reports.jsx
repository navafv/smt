import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Filter,
  Loader2,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

function SummaryCard({ title, value, icon, color }) {
  const Icon = icon;
  const isPositive = value >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md hover:border-slate-300/60">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-xl md:text-2xl font-black tracking-tight ${color || "text-slate-900"}`}
          >
            ₹{value?.toLocaleString() || 0}
          </p>
        </div>
        <div
          className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-colors ${
            isPositive
              ? "bg-emerald-50/60 border-emerald-100"
              : "bg-rose-50/60 border-rose-100"
          }`}
        >
          <Icon
            size={18}
            className={
              isPositive
                ? "text-emerald-600 stroke-[2.5]"
                : "text-rose-600 stroke-[2.5]"
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const [dates, setDates] = useState({ start: today, end: today });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchReport = useCallback(
    async (silent = true) => {
      try {
        if (isMounted.current) setLoading(true);

        const res = await api.get(
          `/reports/?start_date=${dates.start}&end_date=${dates.end}`,
        );

        if (isMounted.current) {
          setReportData(res.data);
          if (!silent) toast.success("Analytical matrix synchronized");
        }
      } catch {
        if (isMounted.current)
          toast.error("Failed to compile financial statistics");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [dates.end, dates.start],
  );

  useEffect(() => {
    fetchReport(true);
  }, [fetchReport]);

  const salesList = useMemo(
    () => reportData?.details?.sales_list || [],
    [reportData],
  );
  const summary = useMemo(() => reportData?.summary || {}, [reportData]);

  const totalOutflow = useMemo(() => {
    return (
      (parseFloat(summary.expenses) || 0) + (parseFloat(summary.wastage) || 0)
    );
  }, [summary.expenses, summary.wastage]);

  const netProfit = useMemo(
    () => parseFloat(summary.net_profit) || 0,
    [summary.net_profit],
  );

  // Memoized multi-channel payment framework breakdown
  const localizedPayments = useMemo(() => {
    return salesList.reduce((acc, sale) => {
      const type = sale.payment_type || "unknown";
      acc[type] = (acc[type] || 0) + parseFloat(sale.total_amount);
      return acc;
    }, {});
  }, [salesList]);

  const exportToCSV = () => {
    if (!salesList.length) {
      toast.error("Dataset empty; compilation aborted");
      return;
    }

    const headers = ["Order ID", "Date", "Customer", "Amount", "Payment Type"];
    const rows = salesList.map((sale) => [
      `SMT-${sale.id}`,
      new Date(sale.created_at).toLocaleDateString(),
      sale.customer_name || "Walk-in",
      parseFloat(sale.total_amount).toFixed(2),
      (sale.payment_type || "unknown").toUpperCase(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SMT_Financials_${dates.start}_to_${dates.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV dataset preserved locally");
  };

  return (
    <div className="space-y-6 pb-24 select-none animate-fade-in">
      {/* Structural Page Title Section */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Financial Auditing
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Performance Analytics & Cost Distributions
        </p>
      </div>

      {/* Responsive Date Pipeline Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
          <Filter size={15} className="text-emerald-600 stroke-[2.5]" />
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Date Constraint Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Start Epoch Limit
            </label>
            <input
              type="date"
              className="w-full p-3 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/50"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Terminal Boundary Date
            </label>
            <input
              type="date"
              className="w-full p-3 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/50"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
        </div>

        {/* System Trigger Actions Hub */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-3 border-t border-slate-100/80">
          <button
            onClick={() => fetchReport(false)}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-850 text-xs font-bold text-white py-3.5 rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin stroke-[2.5]" />
            ) : (
              <RefreshCcw size={14} className="stroke-[2.5]" />
            )}
            <span>Synchronize Metrics</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={!salesList.length || loading}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 py-3.5 rounded-xl transition-all active:bg-slate-50 disabled:opacity-40"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>Export Spreadsheets</span>
          </button>
        </div>
      </div>

      {/* Skeleton Frame Loader Framework */}
      {loading && !reportData && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Main Reporting Block Output */}
      {reportData && (
        <div className="space-y-6">
          {/* Metrics Summary Grid Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              title="Gross Receipts"
              value={summary.sales}
              icon={TrendingUp}
              color="text-slate-900"
            />
            <SummaryCard
              title="Operational Outflow"
              value={totalOutflow}
              icon={Wallet}
              color="text-rose-600"
            />
            <SummaryCard
              title="Calculated Margin"
              value={netProfit}
              icon={TrendingUp}
              color={netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}
            />
            <SummaryCard
              title="Wastage Appraisals"
              value={summary.wastage}
              icon={TrendingDown}
              color="text-amber-600"
            />
          </div>

          {/* Payment Gateway Distribution Layout */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
              Pipeline Settlement Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(localizedPayments).map(([type, amount]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-100 rounded-xl font-semibold"
                >
                  <span className="text-xs text-slate-500 capitalize tracking-wide">
                    {type} Pipeline
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Transaction Records Ledger */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/40">
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Auditable Transactions
              </h2>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                Showing top {Math.min(salesList.length, 20)} chronological
                instances
              </p>
            </div>

            {/* DESKTOP REVENUE LEDGER MATRIX */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Identifier Reference</th>
                    <th className="px-5 py-3.5">Settlement Timestamp</th>
                    <th className="px-5 py-3.5">Registered Receiver</th>
                    <th className="px-5 py-3.5">Operational Pathway</th>
                    <th className="px-5 py-3.5 text-right">Settled Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-xs">
                  {salesList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-8 text-center text-slate-400"
                      >
                        Zero transactional logs logged inside selected timeframe
                      </td>
                    </tr>
                  ) : (
                    salesList.slice(0, 20).map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 font-extrabold text-slate-900">
                          #SMT-{sale.id}
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-medium">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-slate-800">
                          {sale.customer_name || "Walk-in Client"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              sale.payment_type === "cash"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : "bg-amber-50 border-amber-100 text-amber-700"
                            }`}
                          >
                            {sale.payment_type || "unknown"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                          ₹{parseFloat(sale.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CONDENSED STREAM SUMMARY LIST */}
            <div className="divide-y divide-slate-100 block md:hidden">
              {salesList.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">
                  Zero transactional logs discovered inside timeframe
                </div>
              ) : (
                salesList.slice(0, 20).map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">
                          #SMT-{sale.id}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-base font-black text-slate-900">
                        ₹{parseFloat(sale.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-semibold text-slate-600">
                        {sale.customer_name || "Walk-in Buyer"}
                      </p>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${
                          sale.payment_type === "cash"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}
                      >
                        {sale.payment_type || "unknown"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
