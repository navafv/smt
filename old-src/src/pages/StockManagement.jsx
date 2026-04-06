import { useState, useEffect } from "react";
import api from "../api";
import { AlertTriangle, ArrowDown, ArrowUp, RefreshCcw } from "lucide-react";

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all"); // all, low

  const fetchStock = () =>
    api.get("/products/").then((res) => setProducts(res.data));
  useEffect(() => {
    fetchStock();
  }, []);

  const filteredProducts =
    filter === "low" ? products.filter((p) => p.is_low_stock) : products;

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            Inventory Status
          </h1>
          <p className="text-gray-500 font-medium">
            Real-time stock tracking for SMT
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${filter === "all" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${filter === "low" ? "bg-white shadow-sm text-red-600" : "text-gray-500"}`}
          >
            Low Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`bg-white p-6 rounded-3xl border-2 transition-all ${p.is_low_stock ? "border-red-100 bg-red-50/30" : "border-gray-50 hover:border-green-100"}`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
              {p.is_low_stock && (
                <AlertTriangle
                  className="text-red-500 animate-pulse"
                  size={20}
                />
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-black ${p.is_low_stock ? "text-red-600" : "text-gray-900"}`}
              >
                {p.stock_quantity}
              </span>
              <span className="text-gray-400 font-bold uppercase text-xs">
                {p.unit}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">
                Limit: {p.low_stock_threshold} {p.unit}
              </span>
              <div
                className={`h-2 w-2 rounded-full ${p.is_low_stock ? "bg-red-500" : "bg-green-500"}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
