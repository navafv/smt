import { useCallback, useEffect, useRef, useState } from "react";
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color || "text-gray-900"}`}>
            ₹{value?.toLocaleString() || 0}
          </p>
        </div>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            isPositive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <Icon
            size={20}
            className={isPositive ? "text-green-600" : "text-red-600"}
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
          if (!silent) toast.success("Report updated");
        }
      } catch {
        if (isMounted.current) toast.error("Failed to load report");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [dates.end, dates.start],
  );

  useEffect(() => {
    fetchReport(true);
  }, [fetchReport]);

  const salesList = reportData?.details?.sales_list || [];
  const summary = reportData?.summary || {};

  const totalOutflow =
    (parseFloat(summary.expenses) || 0) + (parseFloat(summary.wastage) || 0);
  const netProfit = parseFloat(summary.net_profit) || 0;

  const exportToCSV = () => {
    if (!salesList.length) {
      toast.error("No data to export");
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
    link.download = `SMT_Report_${dates.start}_to_${dates.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="space-y-5 pb-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Sales & financial analysis</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Date Range</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              End Date
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => fetchReport(false)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium active:scale-98"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCcw size={18} />
              )}
              Update
            </button>

            <button
              onClick={exportToCSV}
              disabled={!salesList.length || loading}
              className="flex items-center justify-center gap-2 border border-gray-200 bg-white py-3 rounded-xl font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !reportData && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {/* Report Data */}
      {reportData && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Revenue"
              value={summary.sales}
              icon={TrendingUp}
              color="text-green-600"
            />
            <SummaryCard
              title="Outflow"
              value={totalOutflow}
              icon={Wallet}
              color="text-red-600"
            />
            <SummaryCard
              title="Net Profit"
              value={netProfit}
              icon={TrendingUp}
              color={netProfit >= 0 ? "text-green-600" : "text-red-600"}
            />
            <SummaryCard
              title="Wastage"
              value={summary.wastage}
              icon={TrendingDown}
              color="text-amber-600"
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">
              Payment Methods
            </h2>
            <div className="space-y-2">
              {(() => {
                const payments = salesList.reduce((acc, sale) => {
                  const type = sale.payment_type || "unknown";
                  acc[type] = (acc[type] || 0) + parseFloat(sale.total_amount);
                  return acc;
                }, {});

                return Object.entries(payments).map(([type, amount]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="font-medium text-gray-900 capitalize">
                      {type}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Transactions</h2>
              <p className="text-xs text-gray-500 mt-1">
                {salesList.length} orders found
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {salesList.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No transactions for this period
                </div>
              ) : (
                salesList.slice(0, 20).map((sale) => (
                  <div key={sale.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #SMT-{sale.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₹{parseFloat(sale.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {sale.customer_name || "Walk-in"}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          sale.payment_type === "cash"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
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
