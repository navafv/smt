import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Package,
  Loader2,
  BarChart2,
  Layers,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      toast.error("Failed to sync live core inventory indices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (filter === "low" ? p.is_low_stock : true))
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, filter, searchTerm]);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.is_low_stock).length,
    [products],
  );

  // Safely compute percentage width for itemized threshold bars
  const calculateStockBarWidth = (current, minThreshold) => {
    const baseThreshold = parseFloat(minThreshold) || 1;
    const currentVal = parseFloat(current) || 0;
    // Set baseline target maximum range representation to 250% of minimum threshold value
    const targetScaleMax = baseThreshold * 2.5;
    return `${Math.min(100, Math.max(8, (currentVal / targetScaleMax) * 100))}%`;
  };

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Structural Module Header Section */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Warehouse Stock Logs
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          {products.length} Logged SKU Targets
        </p>
      </div>

      {/* Structural Filtering Control Segment Row */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-99 ${
            filter === "all"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Managed Items
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-99 ${
            filter === "low"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Low Threshold Targets</span>
          {lowStockCount > 0 && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md font-mono ${
                filter === "low"
                  ? "bg-white/20 text-white"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* Real-time Query Module */}
      <div className="relative group">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Query stock metadata via string parameters..."
          className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Interactive Core State Pipelines */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-emerald-600 stroke-[2.5]"
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <Package size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            No active SKU segments matched parameters
          </p>
          {filter === "low" && (
            <button
              onClick={() => setFilter("all")}
              className="text-xs font-black text-emerald-600 uppercase tracking-wider mt-2 hover:underline"
            >
              Reset to master catalog view
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* DESKTOP ROW DATA GRID LEDGER */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Product Metadata Reference</th>
                  <th className="px-5 py-3.5">Status Flag</th>
                  <th className="px-5 py-3.5">Minimum Bounds</th>
                  <th className="px-5 py-3.5 w-1/4">
                    Volumetric Health Matrix
                  </th>
                  <th className="px-5 py-3.5 text-right">
                    Available Volume Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-xs">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                      {p.name}
                    </td>
                    <td className="px-5 py-4">
                      {p.is_low_stock ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 border border-rose-100 animate-pulse">
                          <AlertTriangle size={10} className="stroke-[3]" />
                          Critical Deficit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 border border-emerald-100">
                          Secure Balance
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono font-bold">
                      {p.low_stock_threshold}{" "}
                      <span className="text-[10px] uppercase font-sans tracking-wider">
                        {p.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/40">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.is_low_stock ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{
                              width: calculateStockBarWidth(
                                p.stock_quantity,
                                p.low_stock_threshold,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-900 text-sm font-mono">
                      {p.stock_quantity}{" "}
                      <span className="text-[11px] font-bold text-slate-400 font-sans uppercase tracking-wider ml-0.5">
                        {p.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE DOUBLE-COLUMN FLEX STREAM VIEW */}
          <div className="grid grid-cols-2 gap-3 block md:hidden">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border transition-all ${
                  p.is_low_stock
                    ? "bg-rose-50/40 border-rose-200/70 shadow-xs"
                    : "bg-white border-slate-100 shadow-xs"
                }`}
              >
                {/* Product Core Identifiers */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-2 leading-tight flex-1">
                    {p.name}
                  </h3>
                  {p.is_low_stock ? (
                    <AlertTriangle
                      size={14}
                      className="text-rose-500 shrink-0 stroke-[2.5]"
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Quantitative Volume Readout */}
                <div className="mb-2.5 flex items-baseline">
                  <span
                    className={`text-xl font-black font-mono tracking-tight ${p.is_low_stock ? "text-rose-600" : "text-slate-900"}`}
                  >
                    {p.stock_quantity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wide">
                    {p.unit}
                  </span>
                </div>

                {/* System Volume Status Gauges */}
                <div className="space-y-1 pt-1.5 border-t border-slate-100/70">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">
                      Level
                    </span>
                    <span
                      className={`font-black uppercase tracking-wide ${p.is_low_stock ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {p.is_low_stock ? "Deficit" : "Nominal"}
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.is_low_stock ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{
                        width: calculateStockBarWidth(
                          p.stock_quantity,
                          p.low_stock_threshold,
                        ),
                      }}
                    />
                  </div>

                  <p className="text-[9px] font-bold text-slate-400/90 tracking-wide pt-0.5 font-mono">
                    Min Threshold: {p.low_stock_threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
