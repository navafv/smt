import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import api from "../api";
import ProductForm from "../components/ProductForm";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}/`);
      toast.success(`${name} deleted`);
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">{products.length} items</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex h-11 items-center gap-2 rounded-xl bg-green-600 px-4 font-medium text-white active:scale-98"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <Package size={40} className="mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.is_low_stock && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        <AlertTriangle size={10} />
                        Low
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrencyINR(product.price_per_unit)} / {product.unit}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Stock: {product.stock_quantity} {product.unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-red-100 active:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setShowForm(false);
            fetchProducts();
            toast.success(editingProduct ? "Product updated" : "Product added");
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
