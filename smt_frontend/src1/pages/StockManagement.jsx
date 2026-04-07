import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Package,
  CheckCircle2,
  Filter,
  RefreshCw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'low'
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      toast.error("Failed to sync inventory status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Optimized Filter + Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (filter === "low" ? p.is_low_stock : true))
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, filter, searchTerm]);

  const lowStockCount = products.filter((p) => p.is_low_stock).length;

  return (
    <div className="space-y-8 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Inventory Status
          </h1>
          <p className="mt-1 font-bold text-slate-400 uppercase tracking-widest text-xs">
            Real-time tracking for SMT Fruits
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ALL ITEMS
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              filter === "low"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                : "text-slate-500 hover:text-rose-500"
            }`}
          >
            LOW STOCK
            {lowStockCount > 0 && (
              <span className="bg-white/20 px-1.5 rounded text-[10px]">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by fruit name..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- STOCK GRID --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter">
            Scanning Shelves...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((p) => {
            // Calculate "Health" percentage for the visual bar
            const health = Math.min(
              100,
              (p.stock_quantity / (p.low_stock_threshold * 3)) * 100,
            );

            return (
              <div
                key={p.id}
                className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-8 transition-all hover:shadow-xl ${
                  p.is_low_stock
                    ? "border-rose-100 bg-rose-50/30"
                    : "border-slate-50 bg-white hover:border-emerald-100"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {p.unit} Base Unit
                    </p>
                  </div>
                  {p.is_low_stock ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 animate-pulse">
                      <AlertTriangle size={20} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span
                    className={`text-5xl font-black tracking-tighter ${p.is_low_stock ? "text-rose-600" : "text-slate-900"}`}
                  >
                    {p.stock_quantity}
                  </span>
                  <span className="text-sm font-black text-slate-400 uppercase">
                    Available
                  </span>
                </div>

                {/* Stock Health Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    <span>Threshold: {p.low_stock_threshold}</span>
                    <span>Status</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${p.is_low_stock ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </div>

                {/* Decorative Icon Background */}
                <Package
                  size={80}
                  className={`absolute -right-4 -bottom-4 opacity-[0.03] ${p.is_low_stock ? "text-rose-600" : "text-emerald-600"}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {!loading && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 rounded-4xl bg-slate-50 flex items-center justify-center text-slate-300">
            <Package size={40} />
          </div>
          <div>
            <p className="text-lg font-black text-slate-400">No items found</p>
            <p className="text-sm font-bold text-slate-300">
              Try adjusting your search or filters.
            </p>
          </div>
          {filter === "low" && (
            <button
              onClick={() => setFilter("all")}
              className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Back to all stock
            </button>
          )}
        </div>
      )}
    </div>
  );
}
