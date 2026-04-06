import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import {
  TrendingDown,
  Trash2,
  Search,
  Calendar,
  Package,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LossReport() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLossData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stock-returns/");
      // Filter for only wastage entries on the client side
      const lossData = res.data.filter(
        (item) => item.return_type === "wastage",
      );
      setEntries(lossData);
    } catch {
      toast.error("Failed to load loss records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLossData();
  }, []);

  // Optimized Search Filter
  const filteredEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        e.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.reason && e.reason.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [entries, searchTerm]);

  // Memoized Calculation for performance
  const totalLossValue = useMemo(() => {
    return filteredEntries.reduce(
      (sum, item) => sum + Number(item.loss_amount),
      0,
    );
  }, [filteredEntries]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-8 p-4 md:p-0 pb-24">
      {/* --- HEADER & SUMMARY --- */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Loss Tracking
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Spoilage & Wastage Audit
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-4xl border border-rose-100 bg-rose-50/50 p-4 pr-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
              Total Value Lost
            </p>
            <p className="text-2xl font-black text-rose-600">
              ₹{totalLossValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* --- SEARCHBAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by fruit name or reason (e.g. Spoiled, Damaged)..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- DATA VIEW --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter text-xs">
            Auditing stock losses...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Product
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Impact
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Reason / Note
                  </th>
                  <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Financial Loss
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntries.map((e) => (
                  <tr
                    key={e.id}
                    className="group hover:bg-rose-50/20 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {formatDate(e.created_at)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                          <Package size={16} />
                        </div>
                        <span className="font-black text-slate-800">
                          {e.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-bold text-slate-500">
                        {e.quantity}{" "}
                        <span className="text-[10px] uppercase text-slate-400">
                          Qty Removed
                        </span>
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 italic">
                        <AlertCircle size={14} className="text-rose-300" />
                        {e.reason || "Standard wastage"}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-lg font-black text-rose-600">
                        -₹{Number(e.loss_amount).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="grid grid-cols-1 divide-y divide-slate-100 lg:hidden">
            {filteredEntries.map((e) => (
              <div key={e.id} className="p-6 space-y-4 active:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 leading-none">
                        {e.product_name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                        {formatDate(e.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-rose-600">
                    -₹{Number(e.loss_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Qty: {e.quantity}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 italic">
                    {e.reason || "Unspecified Loss"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredEntries.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <CheckCircle2
                size={48}
                strokeWidth={1}
                className="mb-4 text-emerald-300"
              />
              <p className="font-bold italic text-slate-400">
                Inventory is healthy. No losses recorded.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- INFO TIP --- */}
      <div className="flex items-start gap-4 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 text-blue-700">
        <Info size={20} className="shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-tight">
            Data Integrity Note
          </p>
          <p className="text-xs font-medium leading-relaxed opacity-80">
            Loss amounts are calculated based on the cost price at the time of
            purchase. These figures directly reduce your net profit calculations
            in the Business Reports.
          </p>
        </div>
      </div>
    </div>
  );
}
