import React, { useState, useEffect } from "react";
import {
  RefreshCcw,
  Package,
  Loader2,
  ArrowRightLeft,
  Info,
} from "lucide-react";
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
        toast.error("Failed to load active system directory parameters.");
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product) {
      return toast.error("Please assign a valid product target lookup key.");
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      return toast.error("Enter a valid processing quantitative balance.");
    }
    if (formData.return_type === "supplier" && !formData.supplier) {
      return toast.error(
        "Please explicitly declare a destination supplier entity.",
      );
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

      toast.success("Inventory adjusted and committed successfully.");

      setFormData({
        product: "",
        supplier: "",
        return_type: "wastage",
        quantity: "",
        reason: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Adjustment pipeline request failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyles = () => {
    switch (formData.return_type) {
      case "customer":
        return {
          bg: "bg-emerald-50/50",
          border: "border-emerald-200/80",
          accent: "text-emerald-700",
          ring: "focus:border-emerald-500 focus:ring-emerald-500/10",
          btn: "bg-emerald-600 hover:bg-emerald-700",
          label: "Customer Inbound Return (+ Volumetric Stock)",
        };
      case "supplier":
        return {
          bg: "bg-amber-50/50",
          border: "border-amber-200/80",
          accent: "text-amber-700",
          ring: "focus:border-amber-500 focus:ring-amber-500/10",
          btn: "bg-amber-600 hover:bg-amber-700",
          label: "Supplier Outbound Return (- Volumetric Stock)",
        };
      default:
        return {
          bg: "bg-rose-50/50",
          border: "border-rose-200/80",
          accent: "text-rose-700",
          ring: "focus:border-rose-500 focus:ring-rose-500/10",
          btn: "bg-rose-600 hover:bg-rose-700",
          label: "Wastage / Material Write-off (- Volumetric Stock)",
        };
    }
  };

  const style = getTypeStyles();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-rose-600 stroke-[2.5]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Component Structural Module Header */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Stock Adjustments
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Reconcile warehouse returns, defects & operational wastage
        </p>
      </div>

      {/* Main Form Split Panel Container Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* ACTION INTERACTIVE ENTRY FORM COLUMN */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 md:col-span-7"
        >
          {/* Adjustment Class Selection */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Adjustment Class / Path
            </label>
            <select
              className={`w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer ${style.ring}`}
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
              <option value="wastage">Wastage / Spoiled / Loss</option>
              <option value="customer">Customer Return Pipeline</option>
              <option value="supplier">Supplier Return Rejection</option>
            </select>
          </div>

          {/* Product Lookup Selection */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Target Inventory Item Reference
            </label>
            <select
              required
              className={`w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer ${style.ring}`}
              value={formData.product}
              onChange={(e) =>
                setFormData({ ...formData, product: e.target.value })
              }
            >
              <option value="">Select managed SKU element</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — [Available Balance: {p.stock_quantity}{" "}
                  {p.unit || ""}]
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Entity Lookup (Conditional Element Grid Block) */}
          {formData.return_type === "supplier" && (
            <div className="animate-fade-in">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Destination Supplier Entity Allocation
              </label>
              <select
                required
                className={`w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer ${style.ring}`}
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
              >
                <option value="">Select registered partner entity</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity Variable Numeric Input Block */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Reconciled Quantity Scale
            </label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              className={`w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-bold font-mono text-slate-700 outline-none transition-all ${style.ring}`}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          {/* Reason Configuration Alpha String Block */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Audit Reason / Validation Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Transit Fracture, Defective Batch, Out of Date"
              className={`w-full px-4 py-3 border border-slate-200 bg-slate-50/30 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all ${style.ring}`}
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>

          {/* Submit Trigger Execution Element */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${style.btn} text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-97 shadow-xs disabled:opacity-50 mt-2`}
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin stroke-[2.5]" />
            ) : (
              <>
                <RefreshCcw size={14} className="stroke-[2.5]" />
                {formData.return_type === "wastage"
                  ? "Commit Loss Vector"
                  : "Authorize Matrix Adjustment"}
              </>
            )}
          </button>
        </form>

        {/* CONTROLLER INFORMATION EXPLANATORY GUIDE COLUMN */}
        <div
          className={`rounded-2xl p-4 border shadow-xs transition-all duration-300 md:col-span-5 space-y-2.5 ${style.bg} ${style.border}`}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/40">
            <Info size={14} className={`${style.accent} stroke-[2.5]`} />
            <p
              className={`text-[11px] font-black uppercase tracking-wider ${style.accent}`}
            >
              {style.label}
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            {formData.return_type === "wastage"
              ? "Executing this processing cycle will permanently subtract units directly from the system storage balance indexes and format an operational loss entry row inside overhead data buckets."
              : formData.return_type === "customer"
                ? "Executing this option increments your local storage balances, indicating that returned items are confirmed safe to be repackaged, reintegrated, and redistributed."
                : "Executing this transaction pathway drops warehouse balance levels to trace physical freight stock sent backwards along supplier return shipping streams."}
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <ArrowRightLeft size={12} />
            <span>
              Updates local log files instantly on validation approval.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
