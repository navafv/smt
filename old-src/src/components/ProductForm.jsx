import { useState, useEffect } from "react";
import api from "../api";

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    price_per_unit: "",
    unit: "kg",
    stock_quantity: "",
    low_stock_threshold: "",
  });

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        await api.put(`/products/${product.id}/`, formData);
      } else {
        await api.post("/products/", formData);
      }
      onSuccess();
    } catch {
      alert("Error saving product");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
      <h2 className="text-xl font-bold text-gray-800">
        {product ? "Edit Fruit" : "Add New Fruit"}
      </h2>
      <input
        type="text"
        placeholder="Fruit Name"
        required
        className="w-full border p-2 rounded-md outline-hidden focus:ring-2 focus:ring-green-500"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Price"
          step="0.01"
          className="w-1/2 border p-2 rounded-md"
          value={formData.price_per_unit}
          onChange={(e) =>
            setFormData({ ...formData, price_per_unit: e.target.value })
          }
        />
        <select
          className="w-1/2 border p-2 rounded-md"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        >
          <option value="kg">kg</option>
          <option value="pcs">pcs</option>
          <option value="box">box</option>
        </select>
      </div>

      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Current Stock"
          className="w-1/2 border p-2 rounded-md"
          value={formData.stock_quantity}
          onChange={(e) =>
            setFormData({ ...formData, stock_quantity: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Low Stock Alert at..."
          className="w-1/2 border p-2 rounded-md"
          value={formData.low_stock_threshold}
          onChange={(e) =>
            setFormData({ ...formData, low_stock_threshold: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md font-bold"
        >
          Save Product
        </button>
      </div>
    </form>
  );
}
