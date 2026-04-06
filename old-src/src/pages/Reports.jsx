import { useState, useEffect } from "react";
import api from "../api";
import { Calendar, Download, FileText, TrendingUp, Wallet } from "lucide-react";

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const [dates, setDates] = useState({ start: today, end: today });
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    const res = await api.get(
      `/reports/?start_date=${dates.start}&end_date=${dates.end}`,
    );
    setReportData(res.data);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Simple CSV Export Logic
  const exportToCSV = () => {
    if (!reportData) return;
    const headers = ["ID", "Date", "Amount", "Type"];
    const rows = reportData.details.sales_list.map((s) => [
      s.id,
      s.created_at,
      s.total_amount,
      s.payment_type,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SMT_Report_${dates.start}_to_${dates.end}.csv`,
    );
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900">Business Reports</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100 flex flex-wrap gap-6 items-end mb-8">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase">
            From Date
          </label>
          <input
            type="date"
            className="w-full border-2 p-3 rounded-xl mt-1"
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase">
            To Date
          </label>
          <input
            type="date"
            className="w-full border-2 p-3 rounded-xl mt-1"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </div>
        <button
          onClick={fetchReport}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold h-13"
        >
          Generate Report
        </button>
      </div>

      {reportData && (
        <div className="space-y-8">
          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border-l-8 border-green-500 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Period Sales
              </p>
              <p className="text-3xl font-black text-gray-900">
                ₹{reportData.summary.sales}
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border-l-8 border-red-500 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">
                Period Expenses & Loss
              </p>
              <p className="text-3xl font-black text-gray-900">
                ₹
                {(
                  Number(reportData.summary.expenses) +
                  Number(reportData.summary.wastage)
                ).toFixed(2)}
              </p>
            </div>
            <div
              className={`bg-white p-8 rounded-3xl border-l-8 shadow-sm ${reportData.summary.net_profit >= 0 ? "border-purple-500" : "border-orange-500"}`}
            >
              <p className="text-xs font-bold text-gray-400 uppercase">
                Net Profit
              </p>
              <p className="text-3xl font-black text-gray-900">
                ₹{reportData.summary.net_profit.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Sales Breakdown Table */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b bg-gray-50 flex items-center gap-2">
              <FileText className="text-gray-400" size={20} />
              <h3 className="font-bold">Transaction Breakdown</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-xs text-gray-400 uppercase font-black">
                <tr>
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Type</th>
                  <th className="p-5">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reportData.details.sales_list.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-5 font-mono text-xs">#SMT-{s.id}</td>
                    <td className="p-5 text-sm">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.payment_type === "cash" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {s.payment_type}
                      </span>
                    </td>
                    <td className="p-5 font-bold">₹{s.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
