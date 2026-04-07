import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  User,
  Truck,
  Loader2,
  FileText,
  ArrowRightLeft,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatDateIST } from "../utils/datetime";

export default function PaymentHistory() {
  const [activeTab, setActiveTab] = useState("customers"); // 'customers' or 'suppliers'
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
      toast.error("Failed to sync payment records.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Optimized Search Filter
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const name =
        activeTab === "customers" ? p.customer_name : p.supplier_name;
      return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [payments, searchTerm, activeTab]);

  // Calculate Total for the current view
  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  }, [filteredPayments]);

  const formatDate = (dateString) => {
    return formatDateIST(dateString);
  };

  return (
    <div className="space-y-8 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Payment Registry
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Financial Reconciliation
          </p>
        </div>

        <div
          className={`flex items-center gap-4 rounded-4xl border p-4 pr-8 transition-colors duration-500 ${
            activeTab === "customers"
              ? "bg-emerald-50 border-emerald-100"
              : "bg-rose-50 border-rose-100"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-colors ${
              activeTab === "customers"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {activeTab === "customers" ? (
              <ArrowDownLeft size={24} />
            ) : (
              <ArrowUpRight size={24} />
            )}
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${
                activeTab === "customers" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              Total {activeTab === "customers" ? "Inflow" : "Outflow"}
            </p>
            <p
              className={`text-2xl font-black ${
                activeTab === "customers" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* --- TABS & SEARCH --- */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl bg-slate-100 p-1.5 lg:w-fit">
          <button
            onClick={() => {
              setActiveTab("customers");
              setSearchTerm("");
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all lg:flex-none ${
              activeTab === "customers"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Customer Inflow
          </button>
          <button
            onClick={() => {
              setActiveTab("suppliers");
              setSearchTerm("");
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all lg:flex-none ${
              activeTab === "suppliers"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-500 hover:text-rose-700"
            }`}
          >
            Supplier Outflow
          </button>
        </div>

        <div className="relative group flex-1 max-w-md">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              activeTab === "customers"
                ? "group-focus-within:text-emerald-500"
                : "group-focus-within:text-rose-500"
            } text-slate-400`}
            size={20}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab === "customers" ? "customer" : "supplier"} name...`}
            className={`w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:ring-4 ${
              activeTab === "customers"
                ? "focus:border-emerald-500 focus:ring-emerald-50"
                : "focus:border-rose-500 focus:ring-rose-50"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- DATA VIEW --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter">
            Accessing Vault Records...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          {/* DESKTOP VIEW */}
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {activeTab === "customers"
                      ? "Sender (Customer)"
                      : "Receiver (Supplier)"}
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Transaction Info
                  </th>
                  <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {formatDate(p.date)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white transition-colors">
                          {activeTab === "customers" ? (
                            <User size={16} />
                          ) : (
                            <Truck size={16} />
                          )}
                        </div>
                        <span className="font-black text-slate-800">
                          {activeTab === "customers"
                            ? p.customer_name
                            : p.supplier_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 italic">
                        <FileText size={14} />
                        {p.note || "System Ledger Entry"}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div
                        className={`inline-flex items-center gap-1 text-lg font-black ${
                          activeTab === "customers"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {activeTab === "customers" ? "+" : "-"} ₹
                        {Number(p.amount).toLocaleString("en-IN")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 divide-y divide-slate-100 lg:hidden">
            {filteredPayments.map((p) => (
              <div key={p.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        activeTab === "customers"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {activeTab === "customers" ? (
                        <User size={20} />
                      ) : (
                        <Truck size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 leading-none">
                        {activeTab === "customers"
                          ? p.customer_name
                          : p.supplier_name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                        {formatDate(p.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-black ${
                      activeTab === "customers"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {activeTab === "customers" ? "+" : "-"} ₹
                    {Number(p.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                {p.note && (
                  <div className="rounded-xl bg-slate-50 p-3 text-[11px] font-medium text-slate-500 italic">
                    {p.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredPayments.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <ArrowRightLeft
                size={48}
                strokeWidth={1}
                className="mb-4 opacity-20"
              />
              <p className="font-bold italic">
                No payment records found for this category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
