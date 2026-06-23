import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../api";
import ProductForm from "../components/ProductForm";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load global inventory indexes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(`Permanently drop ${name} from inventory registration?`)
    ) {
      return;
    }

    try {
      await api.delete(`/products/${id}/`);
      toast.success(`${name} evicted successfully`);
      fetchProducts();
    } catch {
      toast.error("Database deletion protocol rejected");
    }
  };

  return (
    <div className="space-y-5 pb-24 select-none animate-fade-in">
      {/* Dynamic Master Control Block */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Stock Master
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            {products.length} Unique SKUs Accounted
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 text-xs font-bold text-white shadow-md transition-all active:scale-95"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Register SKU</span>
        </button>
      </div>

      {/* Catalog Search Hub Component */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Filter localized SKU parameters..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Flush active criteria query strings"
          >
            <X size={16} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Conditional Interface Controller */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-emerald-600 stroke-[2.5]"
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 py-12 text-center">
          <Package size={36} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-400">
            No active products match criteria
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP MATRIX: Scaled Wide Viewports */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Item Catalog Description</th>
                  <th className="px-6 py-4">Standard Operational Unit</th>
                  <th className="px-6 py-4">Wholesale/Retail Valuation</th>
                  <th className="px-6 py-4">Current Ledger Volume</th>
                  <th className="px-6 py-4 text-right">Terminal Action Hub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900">
                          {product.name}
                        </span>
                        {product.is_low_stock && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-black uppercase text-rose-600 tracking-wider">
                            <AlertTriangle size={10} className="stroke-[2.5]" />
                            Critical Limit
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-semibold uppercase text-xs">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrencyINR(product.price_per_unit)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-black ${product.is_low_stock ? "text-rose-600" : "text-slate-800"}`}
                      >
                        {product.stock_quantity}
                      </span>
                      <span className="text-xs text-slate-400 font-bold ml-1 uppercase">
                        {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Modify configuration arguments"
                        >
                          <Edit3 size={15} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Drop ledger assignment entries"
                        >
                          <Trash2 size={15} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE INTERFACE: Compressed Viewports */}
          <div className="space-y-3 block md:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                        {product.name}
                      </h3>
                      {product.is_low_stock && (
                        <span className="flex items-center gap-0.5 rounded-md bg-rose-50 border border-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-600 tracking-wider">
                          <AlertTriangle size={8} className="stroke-[3]" />
                          Low
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      {formatCurrencyINR(product.price_per_unit)}{" "}
                      <span className="text-slate-400 font-medium">
                        / {product.unit}
                      </span>
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 pt-1">
                      Available Stock:{" "}
                      <span
                        className={`font-black ${product.is_low_stock ? "text-rose-600" : "text-slate-700"}`}
                      >
                        {product.stock_quantity} {product.unit}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-all active:scale-90"
                      aria-label="Edit item entry specifications"
                    >
                      <Edit3 size={14} className="stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-rose-600 transition-all active:scale-90"
                      aria-label="Evict product instance records"
                    >
                      <Trash2 size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Structured Modal Layer Backdrop for Forms */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl animate-scale-up">
            <div className="border-b border-slate-100 px-5 py-4 bg-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                {editingProduct
                  ? "Modify Registered SKU"
                  : "Register New Stock Item"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Abort inventory adjustments"
              >
                <X size={16} className="stroke-[2.5]" />
              </button>
            </div>
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <ProductForm
                product={editingProduct}
                onSuccess={() => {
                  setShowForm(false);
                  fetchProducts();
                  toast.success(
                    editingProduct
                      ? "SKU specifications synchronized"
                      : "New product localized and cataloged",
                  );
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
