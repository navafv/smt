import React, { useCallback, useEffect, useState } from "react";
import {
  FileText,
  TrendingUp,
  Wallet,
  PieChart,
  Loader2,
  Filter,
  FileSpreadsheet,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { formatDateIST, todayIST } from "../utils/datetime";

export default function Reports() {
  const today = todayIST();
  const [dates, setDates] = useState({ start: today, end: today });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/reports/?start_date=${dates.start}&end_date=${dates.end}`,
      );
      setReportData(res.data);
      toast.success("Report synchronized");
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  }, [dates.end, dates.start]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportToCSV = () => {
    if (!reportData || !reportData.details.sales_list.length) {
      toast.error("No data available to export.");
      return;
    }

    const headers = ["Order ID", "Date", "Customer", "Amount", "Payment Type"];
    const rows = reportData.details.sales_list.map((sale) => [
      `SMT-${sale.id}`,
      formatDateIST(sale.created_at),
      sale.customer_name || "Walk-in",
      sale.total_amount,
      sale.payment_type.toUpperCase(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `SMT_Financial_Report_${dates.start}_to_${dates.end}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const SummaryCard = ({ title, value, icon, colorClass, subtitle }) => {
    const IconComponent = icon;

    return (
      <div className="relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {title}
            </p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              ₹{Number(value).toLocaleString("en-IN")}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs font-bold italic text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`rounded-2xl p-3 ${colorClass}`}>
            <IconComponent size={24} />
          </div>
        </div>
        <div className={`absolute -bottom-4 -right-4 opacity-5 ${colorClass}`}>
          <IconComponent size={64} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-4 pb-24 md:p-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Business Analytics
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Financial Performance Audit
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={!reportData || loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-white shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:opacity-50"
        >
          <FileSpreadsheet size={20} />
          <span className="text-sm font-black">EXPORT SPREADSHEET</span>
        </button>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Filter size={18} className="text-emerald-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
            Date Range Filter
          </h3>
        </div>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 p-3 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 p-3 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-black text-white transition-all hover:bg-black"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <RefreshCcw size={18} />
            )}
            GENERATE
          </button>
        </div>
      </div>

      {reportData && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SummaryCard
              title="Period Revenue"
              value={reportData.summary.sales}
              icon={TrendingUp}
              colorClass="bg-emerald-50 text-emerald-600"
              subtitle="Gross income from sales"
            />
            <SummaryCard
              title="Total Outflow"
              value={
                Number(reportData.summary.expenses) +
                Number(reportData.summary.wastage)
              }
              icon={Wallet}
              colorClass="bg-rose-50 text-rose-600"
              subtitle="Expenses & Stock Loss"
            />
            <SummaryCard
              title="Operating Profit"
              value={reportData.summary.net_profit}
              icon={PieChart}
              colorClass={
                reportData.summary.net_profit >= 0
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
              }
              subtitle="Net bottom line"
            />
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-slate-400 shadow-sm">
                  <FileText size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
                  Transaction Breakdown
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="p-6">Order</th>
                    <th className="p-6">Date</th>
                    <th className="p-6">Method</th>
                    <th className="p-6 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.details.sales_list.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-slate-50/50">
                      <td className="p-6">
                        <p className="font-black text-slate-800">#SMT-{sale.id}</p>
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                          Order ID
                        </p>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-slate-600">
                          {formatDateIST(sale.created_at)}
                        </span>
                      </td>
                      <td className="p-6">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            sale.payment_type === "cash"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {sale.payment_type}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <p className="text-lg font-black text-slate-900">
                          ₹{sale.total_amount}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.details.sales_list.length === 0 && (
                <div className="py-20 text-center font-bold italic text-slate-300">
                  No transactions for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
