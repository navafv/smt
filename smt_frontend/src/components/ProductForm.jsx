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
    low_stock_threshold: "5", // Sensible default
  });

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price_per_unit: product.price_per_unit,
        unit: product.unit,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Frontend Validation
    if (Number(formData.price_per_unit) <= 0) {
      return toast.error("Price must be greater than zero");
    }

    setIsSubmitting(true);
    try {
      if (product) {
        await api.put(`/products/${product.id}/`, formData);
        toast.success(`${formData.name} updated successfully`);
      } else {
        await api.post("/products/", formData);
        toast.success(`${formData.name} added to inventory`);
      }
      onSuccess();
    } catch (err) {
      const serverError = err.response?.data;
      // Handle specific Django validation errors if they exist
      toast.error(
        typeof serverError === "string"
          ? serverError
          : "Failed to save product details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputGroup = ({ label, icon: Icon, children }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Icon size={18} />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="bg-slate-900 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Package size={20} />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            {product ? "Edit Inventory Item" : "New Inventory Item"}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Product Name */}
        <InputGroup label="Fruit Name" icon={Package}>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Alphonso Mango"
            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            value={formData.name}
            onChange={handleChange}
          />
        </InputGroup>

        {/* Price and Unit Row */}
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Unit Price" icon={IndianRupee}>
            <input
              type="number"
              name="price_per_unit"
              required
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              value={formData.price_per_unit}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup label="Measure Unit" icon={Scale}>
            <select
              name="unit"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 appearance-none"
              value={formData.unit}
              onChange={handleChange}
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="pcs">Pieces (pcs)</option>
              <option value="box">Box</option>
              <option value="gm">Gram (gm)</option>
            </select>
          </InputGroup>
        </div>

        {/* Stock and Threshold Row */}
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Opening Stock" icon={Package}>
            <input
              type="number"
              name="stock_quantity"
              required
              placeholder="0"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              value={formData.stock_quantity}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup label="Low Stock Alert" icon={AlertTriangle}>
            <input
              type="number"
              name="low_stock_threshold"
              required
              placeholder="5"
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-11 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              value={formData.low_stock_threshold}
              onChange={handleChange}
            />
          </InputGroup>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border-2 border-slate-100 py-4 text-sm font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={18} />
                <span>{product ? "Update Fruit" : "Save to Inventory"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
