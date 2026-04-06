import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Search,
  Phone,
  MapPin,
  IndianRupee,
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);

  // Form States
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
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
      toast.error("Failed to load customer directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Optimized Search Filter
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm),
    );
  }, [searchTerm, customers]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/customers/", newCustomer);
      toast.success(`${newCustomer.name} added to directory!`);
      setShowAddModal(false);
      setNewCustomer({ name: "", phone: "", address: "" });
      fetchCustomers();
    } catch (err) {
      const errorMsg = err.response?.data?.phone
        ? "Phone number already registered!"
        : "Failed to add customer.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0)
      return toast.error("Enter a valid amount.");

    setIsSubmitting(true);
    try {
      await api.post("/customer-payments/", {
        customer: showPayModal.id,
        amount: payAmount,
      });
      toast.success(`Received ₹${payAmount} from ${showPayModal.name}`);
      setShowPayModal(null);
      setPayAmount("");
      fetchCustomers();
    } catch {
      toast.error("Payment recording failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Customers
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {customers.length} Contacts Saved
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
        >
          <UserPlus size={20} />
          <span>ADD CUSTOMER</span>
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- CUSTOMER GRID --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter">
            Syncing directory...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <User size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Balance
                  </p>
                  <p
                    className={`text-2xl font-black ${Number(c.balance) > 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    ₹{c.balance}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-800">{c.name}</h3>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-1">
                  <Phone size={14} /> {c.phone}
                </p>
                {c.address && (
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-2 italic">
                    <MapPin size={12} /> {c.address}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowPayModal(c)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 font-black text-sm text-slate-600 transition-all hover:bg-emerald-600 hover:text-white"
              >
                RECEIVE PAYMENT <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL: ADD CUSTOMER --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Register New Customer
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navaf V"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Address (Optional)
                </label>
                <textarea
                  placeholder="Customer address..."
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                  rows="2"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECEIVE PAYMENT --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <IndianRupee size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Clear Debt</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">
                Collecting payment from{" "}
                <span className="text-slate-700">{showPayModal.name}</span>
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">
                  ₹
                </span>
                <input
                  type="number"
                  autoFocus
                  required
                  placeholder="0.00"
                  className="w-full border-b-4 border-slate-100 p-4 pl-12 text-center text-4xl font-black text-emerald-600 outline-none transition-all focus:border-emerald-500"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Confirm Settlement"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="w-full py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl"
                >
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
