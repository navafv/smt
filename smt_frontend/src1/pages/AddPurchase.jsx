import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Save,
  ShoppingBag,
  IndianRupee,
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function AddPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    { product: "", quantity: "", unit_price: "", subtotal: 0 },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          api.get("/suppliers/"),
          api.get("/products/"),
        ]);
        setSuppliers(supRes.data);
        setProducts(prodRes.data);
      } catch {
        toast.error("Failed to sync inventory data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addItemRow = () => {
    setItems([
      ...items,
      { product: "", quantity: "", unit_price: "", subtotal: 0 },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([{ product: "", quantity: "", unit_price: "", subtotal: 0 }]);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-calculate subtotal
    if (field === "quantity" || field === "unit_price") {
      const q = parseFloat(newItems[index].quantity) || 0;
      const p = parseFloat(newItems[index].unit_price) || 0;
      newItems[index].subtotal = (q * p).toFixed(2);
    }
    setItems(newItems);
  };

  const total = useMemo(() => {
    return items
      .reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
      .toFixed(2);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      items.some((item) => !item.product || !item.quantity || !item.unit_price)
    ) {
      return toast.error("Please fill all item details");
    }

    setIsSubmitting(true);
    try {
      await api.post("/purchases/", {
        supplier: selectedSupplier ? Number(selectedSupplier) : null,
        total_amount: total,
        items: items.map((item) => ({
          product: Number(item.product),
          quantity: parseFloat(item.quantity).toFixed(2),
          unit_price: parseFloat(item.unit_price).toFixed(2),
          subtotal: parseFloat(item.subtotal).toFixed(2),
        })),
      });

      toast.success("Stock updated successfully!", { icon: "🚛" });
      setItems([{ product: "", quantity: "", unit_price: 0, subtotal: 0 }]);
      setSelectedSupplier("");
    } catch {
      toast.error("Failed to save purchase entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            Stock Entry
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Inward Supply Management
          </p>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm md:p-10">
        {/* --- SUPPLIER SELECTION --- */}
        <div className="mb-10 max-w-md">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
            Vendor / Supplier
          </label>
          <div className="relative">
            <Truck
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              className="w-full appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-12 pr-10 font-bold text-slate-700 outline-none transition-all focus:border-amber-500 focus:bg-white"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">Direct Purchase / No Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronRight
              className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-300"
              size={18}
            />
          </div>
        </div>

        {/* --- ITEMS TABLE/LIST --- */}
        <div className="space-y-4">
          <div className="hidden grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 md:grid">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Cost Price</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="group relative grid grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md md:grid-cols-12 md:items-center"
            >
              {/* Product Select */}
              <div className="col-span-5">
                <label className="mb-1 block text-[10px] font-bold text-slate-400 md:hidden uppercase">
                  Fruit
                </label>
                <select
                  className="w-full rounded-xl border-2 border-transparent bg-white p-3 font-bold text-slate-700 outline-none focus:border-amber-500"
                  value={item.product}
                  onChange={(e) => updateItem(index, "product", e.target.value)}
                >
                  <option value="">Choose Fruit</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-5">
                <label className="mb-1 block text-[10px] font-bold text-slate-400 md:hidden uppercase">
                  Qty
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  className="w-full rounded-xl border-2 border-transparent bg-white p-3 font-bold text-slate-700 outline-none focus:border-amber-500"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                />
              </div>

              {/* Cost Price */}
              <div className="col-span-5">
                <label className="mb-1 block text-[10px] font-bold text-slate-400 md:hidden uppercase">
                  Cost/Unit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border-2 border-transparent bg-white p-3 pl-7 font-bold text-slate-700 outline-none focus:border-amber-500"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, "unit_price", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Subtotal Display */}
              <div className="col-span-2 text-right">
                <label className="mb-1 block text-[10px] font-bold text-slate-400 md:hidden uppercase">
                  Subtotal
                </label>
                <div className="p-3 font-black text-slate-900">
                  ₹{item.subtotal}
                </div>
              </div>

              {/* Remove Action */}
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeItemRow(index)}
                  className="rounded-lg p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItemRow}
          className="mt-6 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 transition-all hover:bg-amber-50 hover:text-amber-600"
        >
          <Plus size={16} /> ADD ANOTHER ITEM
        </button>

        {/* --- FOOTER SUMMARY --- */}
        <div className="mt-12 flex flex-col gap-6 border-t border-slate-100 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <IndianRupee size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Purchase Value
              </p>
              <h2 className="text-4xl font-black text-slate-900">₹{total}</h2>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-10 py-5 font-black text-white shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={20} />
                <span>FINALIZE ENTRY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-blue-700">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p className="text-xs font-bold leading-relaxed">
          Saving this entry will automatically increase your stock levels and
          update the selected supplier's credit balance. Ensure all cost prices
          are accurate for margin reporting.
        </p>
      </div>
    </div>
  );
}
