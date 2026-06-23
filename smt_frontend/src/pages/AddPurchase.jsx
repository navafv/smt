import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  Truck,
  Layers,
  ChevronDown,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function AddPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([
    { product: "", quantity: "", unit_price: "", subtotal: "0.00" },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersResponse, productsResponse] = await Promise.all([
          api.get("/suppliers/"),
          api.get("/products/"),
        ]);
        setSuppliers(suppliersResponse.data);
        setProducts(productsResponse.data);
      } catch {
        toast.error("Failed to sync structural configuration catalogs.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addItemRow = () => {
    setItems((currentItems) => [
      ...currentItems,
      { product: "", quantity: "", unit_price: "", subtotal: "0.00" },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([
        { product: "", quantity: "", unit_price: "", subtotal: "0.00" },
      ]);
      return;
    }
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const updateItem = (index, field, value) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems];
      nextItems[index][field] = value;

      if (field === "quantity" || field === "unit_price") {
        const quantity = parseFloat(nextItems[index].quantity) || 0;
        const unitPrice = parseFloat(nextItems[index].unit_price) || 0;
        nextItems[index].subtotal = (quantity * unitPrice).toFixed(2);
      }

      return nextItems;
    });
  };

  const total = useMemo(
    () =>
      items
        .reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
        .toFixed(2),
    [items],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      items.some((item) => !item.product || !item.quantity || !item.unit_price)
    ) {
      toast.error("Please settle all unassigned item row parameters.");
      return;
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

      toast.success("Stock manifest aggregated successfully.");
      setItems([
        { product: "", quantity: "", unit_price: "", subtotal: "0.00" },
      ]);
      setSelectedSupplier("");
    } catch {
      toast.error("Failed to commit procurement ledger changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-green-600 stroke-[2.5]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Module Title */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Log Procurement
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Ingest structural vendor inventory allocations
        </p>
      </div>

      {/* Supplier Configuration Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Originating Supplier Account
        </label>
        <div className="relative">
          <Truck
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
          />
          <select
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/40 py-3.5 pl-11 pr-10 text-sm font-bold text-slate-700 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-600/10 cursor-pointer"
            value={selectedSupplier}
            onChange={(event) => setSelectedSupplier(event.target.value)}
          >
            <option value="">Direct Cash Purchase Operations</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5] pointer-events-none"
          />
        </div>
      </div>

      {/* Line Items Container Workspace */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-0.5">
          <Layers size={14} className="text-slate-400 stroke-[2.5]" />
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Itemized Breakdown Ledger
          </h2>
        </div>

        {/* HIGH-DENSITY DESKTOP ROW SPREADSHEET MATRIX */}
        <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 w-5/12">
                  Product Catalog Selection
                </th>
                <th className="px-4 py-3.5 w-2/12">Quantity</th>
                <th className="px-4 py-3.5 w-2/12">Cost Price (INR)</th>
                <th className="px-4 py-3.5 w-2/12 text-right">Row Subtotal</th>
                <th className="px-4 py-3.5 w-1/12 text-center">Clear</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="p-3">
                    <select
                      className="w-full rounded-xl border border-slate-200 p-2.5 outline-none text-xs font-bold text-slate-700 focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all bg-white"
                      value={item.product}
                      onChange={(event) =>
                        updateItem(index, "product", event.target.value)
                      }
                    >
                      <option value="">Select target variant...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono font-bold focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all bg-white"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono font-bold focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all bg-white"
                      value={item.unit_price}
                      onChange={(event) =>
                        updateItem(index, "unit_price", event.target.value)
                      }
                    />
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 text-sm">
                    {formatCurrencyINR(item.subtotal)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 active:scale-95 transition-all"
                    >
                      <Trash2 size={13} className="stroke-[2.5]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE WORKFLOW CARDS OVERVIEW */}
        <div className="space-y-3 block md:hidden">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              <div>
                <label className="mb-1 block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Product Segment
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 p-3 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all"
                  value={item.product}
                  onChange={(event) =>
                    updateItem(index, "product", event.target.value)
                  }
                >
                  <option value="">Select inventory product variant...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold font-mono text-slate-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold font-mono text-slate-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-600/10 transition-all"
                    value={item.unit_price}
                    onChange={(event) =>
                      updateItem(index, "unit_price", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="text-xs font-bold text-slate-500">
                  Subtotal:{" "}
                  <span className="font-extrabold text-slate-900">
                    {formatCurrencyINR(item.subtotal)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100 active:bg-rose-100 transition-colors"
                >
                  <Trash2 size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Append Dynamic Dataset Control Row */}
        <button
          type="button"
          onClick={addItemRow}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all active:scale-99"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Append Manifest Record Row</span>
        </button>
      </div>

      {/* Aggregate Transaction Processing Action Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Purchase Value
            </span>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Aggregate valuation calculated in real-time.
            </p>
          </div>
          <span className="text-2xl font-black text-slate-950 tracking-tight">
            {formatCurrencyINR(total)}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-850 py-4 font-bold text-xs uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin stroke-[2.5]" />
          ) : (
            <>
              <Save size={14} className="stroke-[2.5]" />
              <span>Commit Valuation Manifest</span>
            </>
          )}
        </button>
      </div>

      {/* Operations Notification Boundary Footer */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
        <AlertCircle
          size={15}
          className="mt-0.5 shrink-0 text-blue-600 stroke-[2.5]"
        />
        <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
          Committing this transaction updates core warehouses metrics, appends
          physical item volume logs, and modifies targeted open vendor credit
          configurations.
        </p>
      </div>
    </div>
  );
}
