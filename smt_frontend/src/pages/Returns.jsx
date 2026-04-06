import React, { useState, useEffect } from "react";
import {
  RefreshCcw,
  Trash2,
  ArrowLeftRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Truck,
  Loader2,
  Info,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function Returns() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product: "",
    return_type: "wastage",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/");
        setProducts(res.data);
      } catch {
        toast.error("Failed to load product list.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product) return toast.error("Please select a product");
    if (!formData.quantity || formData.quantity <= 0)
      return toast.error("Enter a valid quantity");

    setIsSubmitting(true);
    try {
      await api.post("/stock-returns/", formData);
      toast.success("Inventory adjusted successfully!", {
        icon: formData.return_type === "wastage" ? "📉" : "🔄",
      });

      setFormData({
        product: "",
        return_type: "wastage",
        quantity: "",
        reason: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Adjustment failed. Check stock levels.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Senior Move: Dynamic UI configuration based on type
  const getTypeStyles = () => {
    switch (formData.return_type) {
      case "customer":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          accent: "text-emerald-600",
          btn: "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700",
          label: "Restock (Inventory +)",
          icon: <CheckCircle2 size={20} />,
        };
      case "supplier":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          accent: "text-amber-600",
          btn: "bg-amber-600 shadow-amber-100 hover:bg-amber-700",
          label: "Supplier Return (Inventory -)",
          icon: <Truck size={20} />,
        };
      default: // wastage
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          accent: "text-rose-600",
          btn: "bg-rose-600 shadow-rose-100 hover:bg-rose-700",
          label: "Loss / Damage (Inventory -)",
          icon: <Trash2 size={20} />,
        };
    }
  };

  const style = getTypeStyles();

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-0">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-3xl shadow-lg transition-colors duration-500 ${style.bg} ${style.accent}`}
        >
          <RefreshCcw
            size={28}
            className={isSubmitting ? "animate-spin" : ""}
          />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            Inventory Adjustment
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Returns & Quality Control
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12 space-y-8 transition-all duration-500"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Action Type
            </label>
            <div className="relative">
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${style.accent}`}
              >
                {style.icon}
              </div>
              <select
                className={`w-full appearance-none rounded-2xl border-2 bg-slate-50 py-4 pl-12 pr-10 font-bold text-slate-700 outline-none transition-all focus:bg-white ${style.border} focus:border-slate-800`}
                value={formData.return_type}
                onChange={(e) =>
                  setFormData({ ...formData, return_type: e.target.value })
                }
              >
                <option value="wastage">Wastage / Spoiled</option>
                <option value="customer">Customer Return</option>
                <option value="supplier">Supplier Return</option>
              </select>
            </div>
          </div>

          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Select Fruit
            </label>
            <div className="relative">
              <Package
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                required
                className="w-full appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-12 pr-10 font-bold text-slate-700 outline-none transition-all focus:border-slate-800 focus:bg-white"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
              >
                <option value="">Choose item...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock_quantity} {p.unit} left)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Quantity
            </label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 px-6 font-black text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Reason / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Broken crates, Overripe"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 px-6 font-bold text-slate-700 outline-none transition-all focus:border-slate-800 focus:bg-white"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 ${style.btn}`}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {formData.return_type === "wastage" ? (
                <AlertTriangle size={20} />
              ) : (
                <ArrowLeftRight size={20} />
              )}
              {formData.return_type === "wastage"
                ? "LOG WASTE & LOSS"
                : "PROCESS ADJUSTMENT"}
            </>
          )}
        </button>
      </form>

      {/* Dynamic Summary Card */}
      <div
        className={`flex items-start gap-4 rounded-3xl border-2 p-6 transition-colors duration-500 ${style.bg} ${style.border}`}
      >
        <div className={`mt-1 ${style.accent}`}>
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <p
            className={`text-xs font-black uppercase tracking-tight ${style.accent}`}
          >
            Operational Impact: {style.label}
          </p>
          <p className="text-xs font-bold leading-relaxed text-slate-500">
            {formData.return_type === "wastage"
              ? "This will reduce your physical stock and be recorded as a financial loss in your daily reports."
              : formData.return_type === "customer"
                ? "This will add items back to your inventory. Use this only for products fit for resale."
                : "This will deduct stock as it is being sent back to the supplier for credit or refund."}
          </p>
        </div>
      </div>
    </div>
  );
}
