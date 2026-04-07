import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Search, Package, Loader2 } from "lucide-react";
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
      toast.error("Failed to load stock");
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

  const lowStockCount = products.filter((p) => p.is_low_stock).length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-sm text-gray-500">{products.length} products</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
            filter === "all"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
            filter === "low" ? "bg-red-500 text-white" : "text-gray-500"
          }`}
        >
          Low Stock
          {lowStockCount > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                filter === "low" ? "bg-white/20" : "bg-red-100 text-red-600"
              }`}
            >
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stock Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package size={40} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">No products found</p>
          {filter === "low" && (
            <button
              onClick={() => setFilter("all")}
              className="text-green-600 text-sm mt-2"
            >
              View all items
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl p-4 border ${
                p.is_low_stock
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              {/* Product Name & Status */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex-1">
                  {p.name}
                </h3>
                {p.is_low_stock ? (
                  <AlertTriangle
                    size={16}
                    className="text-red-500 shrink-0 ml-2"
                  />
                ) : (
                  <div className="w-4 h-4 bg-green-500 rounded-full shrink-0 ml-2" />
                )}
              </div>

              {/* Stock Quantity */}
              <div className="mb-3">
                <span
                  className={`text-2xl font-bold ${p.is_low_stock ? "text-red-600" : "text-gray-900"}`}
                >
                  {p.stock_quantity}
                </span>
                <span className="text-xs text-gray-500 ml-1">{p.unit}</span>
              </div>

              {/* Stock Health Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Stock level</span>
                  <span
                    className={`text-xs font-medium ${p.is_low_stock ? "text-red-600" : "text-green-600"}`}
                  >
                    {p.is_low_stock ? "Critical" : "Good"}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.is_low_stock ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (p.stock_quantity / (p.low_stock_threshold * 3)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Min: {p.low_stock_threshold} {p.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
