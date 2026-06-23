import React, { useState, useEffect } from "react";
import {
  Package,
  IndianRupee,
  Scale,
  AlertTriangle,
  X,
  Save,
  Loader2,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price_per_unit: "",
    unit: "kg",
    stock_quantity: "",
    low_stock_threshold: "5",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price_per_unit: product.price_per_unit || "",
        unit: product.unit || "kg",
        stock_quantity: product.stock_quantity || "",
        low_stock_threshold: product.low_stock_threshold || "5",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.price_per_unit) <= 0) {
      return toast.error(
        "Price matrix parameter values must be greater than zero.",
      );
    }

    setIsSubmitting(true);
    try {
      if (product) {
        await api.put(`/products/${product.id}/`, formData);
        toast.success(
          `SKU configuration for ${formData.name} successfully deployed.`,
        );
      } else {
        await api.post("/products/", formData);
        toast.success(
          `New item registry entry for ${formData.name} initialized.`,
        );
      }
      onSuccess();
    } catch {
      toast.error("Failed to commit product registry modification arrays.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none animate-slide-up">
        {/* Modal Window Control Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="font-black text-slate-900 tracking-tight text-sm uppercase">
              {product ? "Modify Registry SKU" : "Initialize New Product"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {product
                ? "Update database inventory schemas"
                : "Append resource targets to main index"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-500 transition-all active:scale-90 cursor-pointer"
          >
            <X size={15} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Input Parameter Form Structure */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Section: Base Details Identification Keys */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Descriptive Product Identity Key
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Apple Gala Premium, Cavendish Banana"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section: Valuations Matrix Framework Split Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Base Unit Rate (₹)
              </label>
              <input
                type="number"
                name="price_per_unit"
                required
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold font-mono text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={formData.price_per_unit}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Metric Standard Unit
              </label>
              <select
                name="unit"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Freight Box (box)</option>
                <option value="gm">Gram (gm)</option>
              </select>
            </div>
          </div>

          {/* Section: Quantitative Balances Boundary Values Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Initial Stock Ingress
              </label>
              <input
                type="number"
                name="stock_quantity"
                required
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold font-mono text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Low Balance Alert Line
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                required
                step="0.01"
                placeholder="5.00"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold font-mono text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                value={formData.low_stock_threshold}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Trigger Interface Grid Wrapper */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-98 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-97 shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin stroke-[2.5]" />
              ) : (
                <>
                  <Save size={14} className="stroke-[2.5]" />
                  {product ? "Deploy Changes" : "Commit Item"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
