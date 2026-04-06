import { useEffect, useState } from "react";
import api from "../api";

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    api.get("/purchases/").then((res) => setPurchases(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8">Purchase Records</h1>
      <div className="space-y-4">
        {purchases.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-black flex justify-between"
          >
            <div>
              <p className="font-bold text-lg">
                Supplier: {p.supplier_name || "Direct"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {p.items.length} items purchased
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">₹{p.total_amount}</p>
              <button className="text-blue-600 text-sm font-bold">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
