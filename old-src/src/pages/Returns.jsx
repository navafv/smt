import { useState, useEffect } from "react";
import api from "../api";
import { RefreshCcw, Trash2, ArrowLeftRight } from "lucide-react";

export default function Returns() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: "",
    return_type: "wastage",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    api.get("/products/").then((res) => setProducts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stock-returns/", formData);
      alert("Adjustment Recorded!");
      setFormData({
        product: "",
        return_type: "wastage",
        quantity: "",
        reason: "",
      });
    } catch {
      alert("Error: Check stock quantity");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        <RefreshCcw className="text-red-500" /> Stock Returns & Loss
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Adjustment Type
            </label>
            <select
              className="w-full p-4 border-2 rounded-2xl bg-gray-50 font-bold"
              value={formData.return_type}
              onChange={(e) =>
                setFormData({ ...formData, return_type: e.target.value })
              }
            >
              <option value="wastage">Wastage / Spoiled (Loss)</option>
              <option value="customer">Customer Return (Restock)</option>
              <option value="supplier">Supplier Return (Stock Out)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Product
            </label>
            <select
              required
              className="w-full p-4 border-2 rounded-2xl font-medium"
              value={formData.product}
              onChange={(e) =>
                setFormData({ ...formData, product: e.target.value })
              }
            >
              <option value="">Choose Fruit</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Quantity
            </label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full p-4 border-2 rounded-2xl"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Reason / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Overripe, Damaged"
              className="w-full p-4 border-2 rounded-2xl"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-5 rounded-2xl font-black text-white text-lg transition shadow-lg ${formData.return_type === "wastage" ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
        >
          {formData.return_type === "wastage"
            ? "LOG FINANCIAL LOSS"
            : "RESTOCK ITEM"}
        </button>
      </form>
    </div>
  );
}
