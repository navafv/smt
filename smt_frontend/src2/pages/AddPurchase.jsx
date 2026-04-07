import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  Truck,
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
    { product: "", quantity: "", unit_price: "", subtotal: 0 },
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
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addItemRow = () => {
    setItems((currentItems) => [
      ...currentItems,
      { product: "", quantity: "", unit_price: "", subtotal: 0 },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([{ product: "", quantity: "", unit_price: "", subtotal: 0 }]);
      return;
    }

    setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index));
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

    if (items.some((item) => !item.product || !item.quantity || !item.unit_price)) {
      toast.error("Please fill all item details");
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

      toast.success("Stock updated successfully");
      setItems([{ product: "", quantity: "", unit_price: "", subtotal: 0 }]);
      setSelectedSupplier("");
    } catch {
      toast.error("Failed to save purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Add Purchase</h1>
        <p className="text-sm text-gray-500">Update stock inventory</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Supplier (Optional)
        </label>
        <div className="relative">
          <Truck
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={selectedSupplier}
            onChange={(event) => setSelectedSupplier(event.target.value)}
          >
            <option value="">Direct Purchase</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="px-1 font-semibold text-gray-900">Items</h2>

        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">Product</label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                value={item.product}
                onChange={(event) =>
                  updateItem(index, "product", event.target.value)
                }
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", event.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Cost Price (Rs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={item.unit_price}
                  onChange={(event) =>
                    updateItem(index, "unit_price", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-sm text-gray-600">
                Subtotal: {formatCurrencyINR(item.subtotal)}
              </span>
              <button
                onClick={() => removeItemRow(index)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 active:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItemRow}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 font-medium text-gray-500 active:bg-gray-50"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrencyINR(total)}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-semibold text-white active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              Save Purchase
            </>
          )}
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-xs text-blue-700">
          This will increase stock levels and update supplier balance
        </p>
      </div>
    </div>
  );
}
