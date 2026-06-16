import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Package,
  Search,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function LossReport() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLossData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stock-returns/");
      // Explicit filter mapping targeting wastage events exclusively
      const lossData = res.data.filter(
        (item) => item.return_type === "wastage",
      );
      setEntries(lossData);
    } catch {
      toast.error("Failed to load loss records from stock-returns directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLossData();
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.product_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (entry.reason &&
            entry.reason.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [entries, searchTerm],
  );

  const totalLossValue = useMemo(
    () =>
      filteredEntries.reduce(
        (sum, entry) => sum + Number(entry.loss_amount || 0),
        0,
      ),
    [filteredEntries],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Component Title Area & Integrated Aggregated Loss Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Loss & Wastage Report
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            Monitor structural shrinkages, write-offs & spoilage
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-2.5 flex items-center gap-3 self-start sm:self-auto min-w-[160px] justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Capital Lost
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Filtered index scope
            </p>
          </div>
          <p className="text-lg font-black text-rose-600 font-mono tracking-tight">
            {formatCurrencyINR(totalLossValue)}
          </p>
        </div>
      </div>

      {/* Query Search Field Filter */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Query records by SKU identifier or modification validation reasons..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Operational State Render Pipelines */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-rose-600 stroke-[2.5]"
          />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <CheckCircle2
            size={36}
            className="mx-auto text-emerald-500 stroke-[1.8]"
          />
          <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            No shrinkage anomalies found
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            All inventory streams are operating within healthy metrics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* HIGH-DENSITY TABLE VIEW (VISIBLE ON DESKTOP MONITORS) */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 w-1/12 text-center">Status</th>
                  <th className="px-5 py-3.5">SKU Name</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-center">Quantity Lost</th>
                  <th className="px-5 py-3.5 w-4/12">Reason / Log Context</th>
                  <th className="px-5 py-3.5 text-right">Financial Hit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 border border-rose-100">
                        <Trash2 size={13} className="stroke-[2.5]" />
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 text-sm">
                      {entry.product_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono font-bold">
                      {formatDate(entry.created_at || entry.date)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold font-mono text-slate-700 text-sm">
                      {entry.quantity}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium max-w-xs truncate">
                      {entry.reason ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <AlertTriangle
                            size={12}
                            className="text-amber-500 shrink-0"
                          />
                          {entry.reason}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic font-normal">
                          No context logs provided
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black font-mono text-sm text-rose-600">
                      -{formatCurrencyINR(entry.loss_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* STREAMLINED DISCRETE CARD FLOW (VISIBLE ON MOBILE VIEWPORTS) */}
          <div className="space-y-3 block md:hidden">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                      <Package
                        size={16}
                        className="text-rose-500 stroke-[2.2]"
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                        {entry.product_name}
                      </h3>
                      <p className="text-[10px] font-bold font-mono text-slate-400">
                        {formatDate(entry.created_at || entry.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black font-mono text-rose-600 tracking-tight">
                      -{formatCurrencyINR(entry.loss_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/60">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Volume Lost
                    </p>
                    <p className="mt-0.5 text-slate-700 font-mono font-bold text-sm">
                      {entry.quantity}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/60 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Log Reason
                    </p>
                    <p className="mt-0.5 text-slate-600 font-medium truncate">
                      {entry.reason || (
                        <span className="text-slate-300 italic font-normal">
                          Unspecified
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
