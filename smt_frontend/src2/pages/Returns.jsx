import React, { useState, useEffect } from "react";
import { RefreshCcw, Package, Loader2 } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function Returns() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product: "",
    supplier: "",
    return_type: "wastage",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          api.get("/products/"),
          api.get("/suppliers/"),
        ]);
        setProducts(productsRes.data);
        setSuppliers(suppliersRes.data);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product) {
      return toast.error("Select a product");
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      return toast.error("Enter valid quantity");
    }
    if (formData.return_type === "supplier" && !formData.supplier) {
      return toast.error("Select a supplier");
    }

    setIsSubmitting(true);
    try {
      await api.post("/stock-returns/", {
        ...formData,
        supplier:
          formData.return_type === "supplier" && formData.supplier
            ? Number(formData.supplier)
            : null,
      });

      toast.success("Inventory adjusted successfully");

      setFormData({
        product: "",
        supplier: "",
        return_type: "wastage",
        quantity: "",
        reason: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Adjustment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyles = () => {
    switch (formData.return_type) {
      case "customer":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          accent: "text-green-600",
          btn: "bg-green-600",
          label: "Customer Return (+ Stock)",
        };
      case "supplier":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          accent: "text-amber-600",
          btn: "bg-amber-600",
          label: "Supplier Return (- Stock)",
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          accent: "text-red-600",
          btn: "bg-red-600",
          label: "Wastage / Loss (- Stock)",
        };
    }
  };

  const style = getTypeStyles();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Stock Adjustment</h1>
        <p className="text-sm text-gray-500">Returns & wastage</p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4"
      >
        {/* Adjustment Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Adjustment Type
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            value={formData.return_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                return_type: e.target.value,
                supplier:
                  e.target.value === "supplier" ? formData.supplier : "",
              })
            }
          >
            <option value="wastage">Wastage / Spoiled</option>
            <option value="customer">Customer Return</option>
            <option value="supplier">Supplier Return</option>
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Product
          </label>
          <select
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            value={formData.product}
            onChange={(e) =>
              setFormData({ ...formData, product: e.target.value })
            }
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.stock_quantity} {p.unit} left)
              </option>
            ))}
          </select>
        </div>

        {/* Supplier (conditional) */}
        {formData.return_type === "supplier" && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Supplier
            </label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Quantity
          </label>
          <input
            type="number"
            required
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Reason (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Broken, Overripe, Damaged"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${style.btn} text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-4`}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <RefreshCcw size={18} />
              {formData.return_type === "wastage"
                ? "Record Loss"
                : "Process Adjustment"}
            </>
          )}
        </button>
      </form>

      {/* Info Card */}
      <div className={`rounded-xl p-4 ${style.bg} border ${style.border}`}>
        <p className={`text-xs font-medium ${style.accent} mb-1`}>
          {style.label}
        </p>
        <p className="text-xs text-gray-600">
          {formData.return_type === "wastage"
            ? "This will reduce stock and record a financial loss."
            : formData.return_type === "customer"
              ? "This will add items back to inventory for resale."
              : "This will deduct stock being returned to supplier."}
        </p>
      </div>
    </div>
  );
}
