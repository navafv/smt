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

    if (Number(formData.price_per_unit) <= 0) {
      return toast.error("Price must be greater than zero");
    }

    setIsSubmitting(true);
    try {
      if (product) {
        await api.put(`/products/${product.id}/`, formData);
        toast.success(`${formData.name} updated`);
      } else {
        await api.post("/products/", formData);
        toast.success(`${formData.name} added`);
      }
      onSuccess();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md sm:max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onCancel}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Apple, Banana, Orange"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Price and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Price (₹)
              </label>
              <input
                type="number"
                name="price_per_unit"
                required
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                value={formData.price_per_unit}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Unit
              </label>
              <select
                name="unit"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="gm">Gram (gm)</option>
              </select>
            </div>
          </div>

          {/* Stock and Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Stock
              </label>
              <input
                type="number"
                name="stock_quantity"
                required
                step="0.01"
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Low Stock Alert
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                required
                step="0.01"
                placeholder="5"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                value={formData.low_stock_threshold}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 active:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {product ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
