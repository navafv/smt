import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from "lucide-react";
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
      toast.error("Failed to sync structural ledger data pipelines.");
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
    () =>
      filteredPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      ),
    [filteredPayments],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isCustomerMode = activeTab === "customers";

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Component Module Header */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Financial Ledger
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Audit chronological operational cash movements
        </p>
      </div>

      {/* Dynamic Workspace Perspective Switches */}
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => {
            setActiveTab("customers");
            setSearchTerm("");
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-99 ${
            isCustomerMode
              ? "bg-white text-emerald-600 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Inflow (Received)
        </button>
        <button
          onClick={() => {
            setActiveTab("suppliers");
            setSearchTerm("");
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-99 ${
            !isCustomerMode
              ? "bg-white text-rose-600 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Outflow (Paid)
        </button>
      </div>

      {/* Aggregated Balanced Metric Card */}
      <div
        className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between transition-all duration-300 ${
          isCustomerMode
            ? "bg-emerald-50/50 border-emerald-100"
            : "bg-rose-50/50 border-rose-100"
        }`}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Volume {isCustomerMode ? "Ingested" : "Disbursed"}
          </p>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Real-time parameters for filtered view
          </p>
        </div>
        <p
          className={`text-2xl font-black font-mono tracking-tight ${
            isCustomerMode ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {formatCurrencyINR(totalAmount)}
        </p>
      </div>

      {/* Core Dynamic Index Query Field */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder={`Query record metadata via ${isCustomerMode ? "customer" : "supplier"} account keys...`}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all ${
            isCustomerMode
              ? "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              : "focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          }`}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Operational State Render Pipelines */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className={`animate-spin stroke-[2.5] ${isCustomerMode ? "text-emerald-600" : "text-rose-600"}`}
          />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <FileText size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            No payments matched parameters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* HIGH-DENSITY DESKTOP LEDGER ROW MATRIX */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 w-1/12 text-center">Type</th>
                  <th className="px-5 py-3.5">Account Identifier Entity</th>
                  <th className="px-5 py-3.5">Settlement Timestamp</th>
                  <th className="px-5 py-3.5 w-4/12">Operational Notes</th>
                  <th className="px-5 py-3.5 text-right">Transaction Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center">
                      {isCustomerMode ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <ArrowDownLeft size={14} className="stroke-[2.5]" />
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                          <ArrowUpRight size={14} className="stroke-[2.5]" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 text-sm">
                      {isCustomerMode
                        ? payment.customer_name
                        : payment.supplier_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono font-bold">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium max-w-xs truncate">
                      {payment.note ? (
                        payment.note
                      ) : (
                        <span className="text-slate-300 italic">
                          No notes appended
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right font-black font-mono text-sm ${isCustomerMode ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isCustomerMode ? "+" : "-"}{" "}
                      {formatCurrencyINR(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* STANDALONE MOBILE CARD FLOW STREAM */}
          <div className="space-y-3 block md:hidden">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-0.5">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                      {isCustomerMode
                        ? payment.customer_name
                        : payment.supplier_name}
                    </h3>
                    <p className="text-[10px] font-bold font-mono text-slate-400">
                      {formatDate(payment.date)}
                    </p>
                    {payment.note && (
                      <p className="mt-2 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg p-2 border border-slate-100 leading-snug">
                        {payment.note}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-base font-black font-mono tracking-tight ${
                        isCustomerMode ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isCustomerMode ? "+" : "-"}
                      {formatCurrencyINR(payment.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
