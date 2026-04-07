import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Truck, X } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchases/");
      setPurchases(res.data);
    } catch {
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          (purchase.supplier_name &&
            purchase.supplier_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          purchase.id.toString().includes(searchTerm),
      ),
    [purchases, searchTerm],
  );

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Purchases</h1>
        <p className="text-sm text-gray-500">{purchases.length} orders</p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by supplier or ID..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <Truck size={40} className="mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No purchases found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => (
            <button
              key={purchase.id}
              onClick={() => setSelectedPurchase(purchase)}
              className="w-full cursor-pointer rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm active:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      Purchase #{purchase.id}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {purchase.items?.length || 0} items
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {purchase.supplier_name || "Direct Purchase"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(purchase.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrencyINR(purchase.total_amount)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="animate-slide-up flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div>
                <h2 className="font-bold text-gray-900">
                  Purchase #{selectedPurchase.id}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatDate(selectedPurchase.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Supplier</p>
                <p className="font-semibold text-gray-900">
                  {selectedPurchase.supplier_name || "Direct Purchase"}
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Items</h3>
                <div className="space-y-2">
                  {selectedPurchase.items?.map((item, index) => (
                    <div key={index} className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrencyINR(item.unit_price)} / {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs font-medium text-green-600">
                            {formatCurrencyINR(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrencyINR(selectedPurchase.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full rounded-xl bg-gray-900 py-3 font-medium text-white active:scale-98"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
