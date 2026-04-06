import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Box,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Loader2,
} from "lucide-react";
import api from "../api";
import ProductForm from "../components/ProductForm";
import toast from "react-hot-toast";

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
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Optimized Search
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/products/${id}/`);
        toast.success(`${name} removed from inventory.`);
        fetchProducts();
      } catch {
        toast.error("Could not delete product.");
      }
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-0 pb-20">
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            Inventory
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {products.length} Items Total
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
        >
          <Plus size={20} />
          <span>ADD NEW FRUIT</span>
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search inventory..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold">Syncing stock data...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Product Details
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pricing
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Current Stock
                  </th>
                  <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="p-6">
                      <p className="font-black text-slate-800">{p.name}</p>
                      <p className="text-xs font-bold text-slate-400">
                        ID: #PROD-{p.id}
                      </p>
                    </td>
                    <td className="p-6 font-bold text-slate-600">
                      ₹{p.price_per_unit}{" "}
                      <span className="text-[10px] text-slate-400">
                        / {p.unit}
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black transition-all ${
                          p.is_low_stock
                            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                            : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                        }`}
                      >
                        {p.is_low_stock && <AlertTriangle size={12} />}
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setShowForm(true);
                          }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST (Visible only on small screens) */}
          <div className="grid grid-cols-1 divide-y divide-slate-100 lg:hidden">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-5 flex items-center justify-between active:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.is_low_stock ? "bg-rose-50 text-rose-500" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{p.name}</h3>
                    <p className="text-xs font-bold text-slate-400">
                      ₹{p.price_per_unit}/{p.unit}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-black ${p.is_low_stock ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {p.stock_quantity} {p.unit}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowForm(true);
                      }}
                      className="text-slate-400"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-slate-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="font-bold text-slate-300 italic">
                No matching products found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {showForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setShowForm(false);
                fetchProducts();
                toast.success(
                  editingProduct ? "Fruit updated!" : "Fruit added!",
                );
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
