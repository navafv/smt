import { useState, useEffect } from "react";
import api from "../api";

export default function AddPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState([
    { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
  ]);

  useEffect(() => {
    api.get("/suppliers/").then((res) => setSuppliers(res.data));
    api.get("/products/").then((res) => setProducts(res.data));
  }, []);

  const addItemRow = () =>
    setItems([
      ...items,
      { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "unit_price") {
      newItems[index].subtotal =
        newItems[index].quantity * newItems[index].unit_price;
    }
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  const handleSubmit = async () => {
    try {
      await api.post("/purchases/", {
        supplier: selectedSupplier,
        total_amount: total,
        items,
      });
      alert("Purchase Added & Stock Updated!");
      setItems([{ product: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
    } catch {
      alert("Error saving purchase");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-6">Stock Entry (Purchase)</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <select
          className="w-full p-3 mb-6 border rounded-lg"
          onChange={(e) => setSelectedSupplier(e.target.value)}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 mb-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-400">Fruit</label>
              <select
                className="w-full border p-2 rounded"
                onChange={(e) => updateItem(index, "product", e.target.value)}
              >
                <option value="">Choose Fruit</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="Qty"
              className="w-24 border p-2 rounded"
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
            />
            <input
              type="number"
              placeholder="Cost"
              className="w-32 border p-2 rounded"
              onChange={(e) => updateItem(index, "unit_price", e.target.value)}
            />
            <div className="w-32 p-2 bg-gray-50 rounded text-right font-bold">
              ₹{item.subtotal}
            </div>
          </div>
        ))}

        <button onClick={addItemRow} className="text-green-600 font-bold mt-2">
          + Add Another Fruit
        </button>

        <div className="mt-8 border-t pt-6 flex justify-between items-center">
          <p className="text-2xl font-black">Total Cost: ₹{total}</p>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-8 py-3 rounded-xl font-bold"
          >
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
