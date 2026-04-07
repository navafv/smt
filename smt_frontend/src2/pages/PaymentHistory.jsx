import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function PaymentHistory() {
  const [activeTab, setActiveTab] = useState("customers");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "customers"
          ? "/customer-payments/"
          : "/supplier-payments/";
      const res = await api.get(endpoint);
      setPayments(res.data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const name =
          activeTab === "customers"
            ? payment.customer_name
            : payment.supplier_name;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
      }),
    [activeTab, payments, searchTerm],
  );

  const totalAmount = useMemo(
    () => filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [filteredPayments],
  );

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Payment history</p>
      </div>

      <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => {
            setActiveTab("customers");
            setSearchTerm("");
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "customers"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Received
        </button>
        <button
          onClick={() => {
            setActiveTab("suppliers");
            setSearchTerm("");
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "suppliers"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Paid
        </button>
      </div>

      <div
        className={`rounded-xl p-4 ${
          activeTab === "customers" ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <p className="text-xs text-gray-500">
          Total {activeTab === "customers" ? "Received" : "Paid"}
        </p>
        <p
          className={`text-2xl font-bold ${
            activeTab === "customers" ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrencyINR(totalAmount)}
        </p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder={`Search ${
            activeTab === "customers" ? "customer" : "supplier"
          }...`}
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No payment records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {activeTab === "customers"
                      ? payment.customer_name
                      : payment.supplier_name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(payment.date)}
                  </p>
                  {payment.note && (
                    <p className="mt-2 text-xs italic text-gray-400">
                      {payment.note}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      activeTab === "customers"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {activeTab === "customers" ? "+" : "-"}
                    {formatCurrencyINR(payment.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
