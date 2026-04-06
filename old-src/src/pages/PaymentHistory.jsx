import { useState, useEffect } from "react";
import api from "../api";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function PaymentHistory() {
  const [activeTab, setActiveTab] = useState("customers");
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const endpoint =
      activeTab === "customers" ? "/customer-payments/" : "/supplier-payments/";
    api.get(endpoint).then((res) => setPayments(res.data));
  }, [activeTab]);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-black mb-8">Payment Registry</h1>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === "customers" ? "bg-white shadow-sm text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Customer Inflow
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === "suppliers" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Supplier Outflow
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-widest">
                Date
              </th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-widest">
                {activeTab === "customers" ? "From Customer" : "To Supplier"}
              </th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-widest">
                Amount
              </th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-widest">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 text-gray-500">
                  {new Date(p.date).toLocaleDateString()}
                </td>
                <td className="p-5 font-bold text-gray-800">
                  {activeTab === "customers"
                    ? p.customer_name
                    : p.supplier_name}
                </td>
                <td className="p-5">
                  <div
                    className={`flex items-center gap-1 font-black text-lg ${activeTab === "customers" ? "text-green-600" : "text-red-600"}`}
                  >
                    {activeTab === "customers" ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                    ₹{p.amount}
                  </div>
                </td>
                <td className="p-5 text-gray-400 italic">{p.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-medium">
            No payment records found.
          </div>
        )}
      </div>
    </div>
  );
}
