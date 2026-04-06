import { useEffect, useState } from "react";
import api from "../api";
import ProductForm from "../components/ProductForm";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    const res = await api.get("/products/");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/products/${id}/`);
      fetchProducts();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">SMT Inventory</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-green-700 transition"
        >
          + Add Fruit
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <ProductForm
            product={editingProduct}
            onSuccess={() => {
              setShowForm(false);
              fetchProducts();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Product</th>
              <th className="p-4 font-bold text-gray-600">Price/Unit</th>
              <th className="p-4 font-bold text-gray-600">Stock</th>
              <th className="p-4 font-bold text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">
                  ₹{p.price_per_unit} / {p.unit}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${p.is_low_stock ? "bg-red-100 text-red-600 animate-pulse" : "bg-green-100 text-green-600"}`}
                  >
                    {p.stock_quantity} {p.unit}{" "}
                    {p.is_low_stock && "(Low Stock)"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
