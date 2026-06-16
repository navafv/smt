import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Search,
  User,
  UserPlus,
  X,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    address: "",
  });
  const [payAmount, setPayAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers/");
      setCustomers(res.data);
    } catch {
      toast.error("Failed to sync customer registry database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [customers, searchTerm],
  );

  const handleAddCustomer = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/customers/", newCustomer);
      toast.success(`Profile generated successfully for ${newCustomer.name}`);
      setShowAddModal(false);
      setNewCustomer({ name: "", address: "" });
      fetchCustomers();
    } catch (error) {
      toast.error(
        "System integration failure while appending customer profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Invalid transaction: Allocation quantity must be non-zero");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/customer-payments/", {
        customer: showPayModal.id,
        amount: payAmount,
      });
      toast.success(
        `Settled ${formatCurrencyINR(payAmount)} to account of ${showPayModal.name}`,
      );
      setShowPayModal(null);
      setPayAmount("");
      fetchCustomers();
    } catch {
      toast.error("Financial ledger ledger updates rejected by processor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 select-none animate-fade-in">
      {/* Structural Module Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Customer Accounts
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            {customers.length} Verified Relations & Receivables
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-850 px-4 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
        >
          <UserPlus size={15} className="stroke-[2.5]" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Dynamic Filter / Pipeline Query Element */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Query index parameters via name string or identifier digits..."
          className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Core Component State Pipeline Routing */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-emerald-600 stroke-[2.5]"
          />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <User size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            No matching indexes found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* DESKTOP MATRIX LEDGER HOUSING */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl shadow-xs border border-slate-200/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Client Profile Reference</th>
                  <th className="px-5 py-3.5">Registered Location</th>
                  <th className="px-5 py-3.5 text-right">
                    Outstanding Account Status
                  </th>
                  <th className="px-5 py-3.5 text-center">
                    Operational Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-xs">
                {filteredCustomers.map((customer) => {
                  const hasDebit = Number(customer.balance) > 0;
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                        {customer.name}
                      </td>
                      <td className="px-5 py-4 text-slate-400 max-w-xs truncate">
                        {customer.address || (
                          <span className="italic opacity-40">Not defined</span>
                        )}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-black text-sm ${hasDebit ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {formatCurrencyINR(customer.balance)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => setShowPayModal(customer)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-98 text-[11px]"
                        >
                          <span>Process Remittance</span>
                          <ArrowRight size={12} className="stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE STREAM SUMMARY CARDS */}
          <div className="space-y-3 block md:hidden">
            {filteredCustomers.map((customer) => {
              const hasDebit = Number(customer.balance) > 0;
              return (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {customer.name}
                      </h3>
                      {customer.address && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400 truncate pt-0.5">
                          <MapPin
                            size={11}
                            className="stroke-[2.5] flex-shrink-0"
                          />{" "}
                          {customer.address}
                        </p>
                      )}
                    </div>
                    <div className="text-right pl-3">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Balance Status
                      </p>
                      <p
                        className={`text-base font-black tracking-tight mt-0.5 ${hasDebit ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {formatCurrencyINR(customer.balance)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayModal(customer)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 text-xs font-bold text-slate-700 transition-all active:bg-slate-100"
                  >
                    <span>Receive Payment</span>
                    <ArrowRight size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CORE FRAME LAYOUT COMPONENT: PROFILE CREATION DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-xs sm:items-center p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-100 transform animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/40">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Initialize Client Account
                </h2>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Register new profile constraints into global indexes.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} className="stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Full Name / Entity Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ramesh Kumar"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/40"
                  value={newCustomer.name}
                  onChange={(event) =>
                    setNewCustomer({ ...newCustomer, name: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Physical Logistics Location (Optional)
                </label>
                <textarea
                  placeholder="Drop-off point or street delivery notes..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/40"
                  value={newCustomer.address}
                  onChange={(event) =>
                    setNewCustomer({
                      ...newCustomer,
                      address: event.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition-all active:bg-slate-50"
                >
                  Abort Action
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-slate-950 hover:bg-slate-850 py-3 text-xs font-bold text-white transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin stroke-[2.5]" />
                  ) : (
                    "Save Registry Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE FRAME LAYOUT COMPONENT: RECEIVABLES SETTLEMENT DIALOG */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-xs sm:items-center p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-100 transform animate-slide-up overflow-hidden">
            <div className="border-b border-slate-100 p-5 text-center bg-slate-50/40">
              <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Record Account Remittance
              </h2>
              <p className="mt-1 text-sm font-extrabold text-slate-500">
                {showPayModal.name}
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block text-center">
                  Calculated Amount Settled (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    autoFocus
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-3.5 text-center text-xl font-black text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/20 tracking-tight"
                    value={payAmount}
                    onChange={(event) => setPayAmount(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition-all active:bg-slate-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin stroke-[2.5]" />
                  ) : (
                    "Authorize Adjustment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
