import { useEffect, useState } from "react";
import api from "../api";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    api.get("/sales/").then((res) => setSales(res.data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Sales History</h1>

      <div className="space-y-4">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">Order #SMT-{sale.id}</p>
              <p className="text-sm font-medium text-blue-600">
                Customer: {sale.customer_name || "Walk-in"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(sale.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${sale.payment_type === "cash" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}
              >
                {sale.payment_type}
              </span>
              <p className="text-xl font-black">₹{sale.total_amount}</p>
              <button
                onClick={() => setSelectedSale(sale)}
                className="text-green-600 font-bold"
              >
                View Bill
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Preview Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-96 p-8 rounded-none shadow-2xl font-mono text-sm border-t-8 border-green-600">
            <h2 className="text-center text-2xl font-bold mb-2">SMT FRUITS</h2>
            <p className="text-center border-b pb-4 mb-4">Kannur, Kerala</p>

            {selectedSale.items.map((item) => (
              <div key={item.product} className="flex justify-between mb-2">
                <span>
                  {item.product_name} x {item.quantity}
                </span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}

            <div className="border-t border-dashed pt-4 mt-4 text-lg font-bold flex justify-between">
              <span>TOTAL</span>
              <span>₹{selectedSale.total_amount}</span>
            </div>
            <p className="mt-4 text-xs text-center text-gray-400">
              Payment: {selectedSale.payment_type.toUpperCase()}
            </p>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full mt-8 bg-gray-800 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
