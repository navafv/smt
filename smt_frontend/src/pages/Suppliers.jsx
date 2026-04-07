import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  X,
  Plus,
  Wallet,
  Search,
  Phone,
  MapPin,
  Loader2,
  IndianRupee,
  ArrowUpRight,
  ChevronRight,
  Building2,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    address: "",
  });
  const [payAmount, setPayAmount] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers/");
      setSuppliers(res.data);
    } catch {
      toast.error("Failed to sync supplier records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Search logic
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact_number.includes(searchTerm),
    );
  }, [searchTerm, suppliers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/suppliers/", formData);
      toast.success(`${formData.name} added as a partner!`);
      setShowAddModal(false);
      setFormData({ name: "", contact_number: "", address: "" });
      fetchSuppliers();
    } catch {
      toast.error("Could not register supplier.");
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
      await api.post("/supplier-payments/", {
        supplier: showPayModal.id,
        amount: payAmount,
      });
      toast.success(
        `Payment of ₹${payAmount} recorded for ${showPayModal.name}`,
      );
      setShowPayModal(null);
      setPayAmount("");
      fetchSuppliers();
    } catch {
      toast.error("Payment sync failed.");
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
            Suppliers
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {suppliers.length} Active Partners
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-black active:scale-95"
        >
          <Plus size={20} />
          <span>NEW SUPPLIER</span>
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
          placeholder="Search by vendor name or contact..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- SUPPLIER GRID --- */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-4xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  <Building2 size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Payable
                  </p>
                  <p
                    className={`text-2xl font-black ${Number(s.balance) > 0 ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    ₹{s.balance}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-800">{s.name}</h3>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-1">
                  <Phone size={14} /> {s.contact_number}
                </p>
                {s.address && (
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-2 italic truncate">
                    <MapPin size={12} /> {s.address}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowPayModal(s)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 py-3 font-black text-xs uppercase tracking-widest text-amber-700 transition-all hover:bg-amber-600 hover:text-white"
              >
                <Wallet size={16} /> RECORD SETTLEMENT
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL: ADD SUPPLIER --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Truck className="text-emerald-400" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  New Partner
                </h2>
              </div>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala Fruit Hub"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="Supplier phone..."
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  onChange={(e) =>
                    setFormData({ ...formData, contact_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Office Address
                </label>
                <textarea
                  placeholder="Full location..."
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  rows="2"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Save Supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECORD PAYMENT --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <IndianRupee size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Settle Vendor
              </h2>
              <p className="text-sm font-bold text-slate-400 mt-1">
                Paying{" "}
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
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border-b-4 border-slate-100 p-4 pl-12 text-center text-4xl font-black text-amber-600 outline-none focus:border-amber-500"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="w-full py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
