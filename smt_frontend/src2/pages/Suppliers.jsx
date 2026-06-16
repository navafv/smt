import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  Phone,
  Plus,
  Search,
  Truck,
  Wallet,
  X,
  MapPin,
  ArrowRight,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contact_number.includes(searchTerm),
      ),
    [searchTerm, suppliers],
  );

  const handleAdd = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/suppliers/", formData);
      toast.success(`${formData.name} added`);
      setShowAddModal(false);
      setFormData({ name: "", contact_number: "", address: "" });
      fetchSuppliers();
    } catch {
      toast.error("Failed to add supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/supplier-payments/", {
        supplier: showPayModal.id,
        amount: payAmount,
      });
      toast.success(
        `Payment of ₹${Number(payAmount).toLocaleString()} recorded for ${showPayModal.name}`,
      );
      setShowPayModal(null);
      setPayAmount("");
      fetchSuppliers();
    } catch {
      toast.error("Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Header Dashboard Summary */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Suppliers
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            {suppliers.length} Active Partners
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-4 bg-slate-950 hover:bg-slate-850 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>New Supplier</span>
        </button>
      </div>

      {/* Search Input Filter Component */}
      <div className="relative group">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Query partner indexes via name or contact numbers..."
          className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none text-sm font-semibold text-slate-700 bg-white transition-all"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Main Structural Layout Processing Switch */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-green-600 stroke-[2.5]"
          />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Building2
            size={36}
            className="text-slate-300 mx-auto stroke-[1.5]"
          />
          <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
            No matching suppliers discovered
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* DESKTOP LEDGER VIEWPORT MATRIX */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Vendor Label / Entity</th>
                  <th className="px-5 py-3.5">Contact Channel</th>
                  <th className="px-5 py-3.5">Registered Location</th>
                  <th className="px-5 py-3.5 text-right">
                    Net Outstanding Payables
                  </th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-xs">
                {filteredSuppliers.map((supplier) => {
                  const hasPayable = Number(supplier.balance) > 0;
                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                        {supplier.name}
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono font-medium">
                        {supplier.contact_number}
                      </td>
                      <td className="px-5 py-4 text-slate-400 max-w-xs truncate">
                        {supplier.address || (
                          <span className="italic opacity-40">Not defined</span>
                        )}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-black text-sm ${hasPayable ? "text-amber-600" : "text-green-600"}`}
                      >
                        ₹
                        {parseFloat(supplier.balance).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => setShowPayModal(supplier)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-98 text-[11px]"
                        >
                          <span>Process Settlement</span>
                          <ArrowRight size={12} className="stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE DISPLAY VIEW STREAM */}
          <div className="space-y-3 block md:hidden">
            {filteredSuppliers.map((supplier) => {
              const hasPayable = Number(supplier.balance) > 0;
              return (
                <div
                  key={supplier.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {supplier.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
                        <Phone size={12} className="stroke-[2.5]" />
                        {supplier.contact_number}
                      </p>
                      {supplier.address && (
                        <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1 pt-0.5">
                          <MapPin
                            size={11}
                            className="stroke-[2.5] flex-shrink-0"
                          />
                          {supplier.address}
                        </p>
                      )}
                    </div>
                    <div className="text-right pl-3">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Balance
                      </p>
                      <p
                        className={`text-base font-black tracking-tight mt-0.5 ${hasPayable ? "text-amber-600" : "text-green-600"}`}
                      >
                        ₹{parseFloat(supplier.balance).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayModal(supplier)}
                    className="w-full py-2.5 bg-amber-50/60 rounded-xl text-xs font-bold text-amber-800 flex items-center justify-center gap-2 border border-slate-200 transition-all active:bg-amber-100"
                  >
                    <Wallet size={13} className="stroke-[2.5]" />
                    Record Payment
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Supplier Dialog Box */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md border border-slate-100 shadow-xl overflow-hidden transform animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-2.5">
                <Truck size={18} className="text-green-600 stroke-[2.5]" />
                <div>
                  <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    Initialize Vendor Index
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Register operational vendor coordinates inside ledger.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} className="stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Supplier Name / Brand Entity
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kerala Fruit Hub"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-600/10 outline-none text-sm font-semibold text-slate-700 bg-slate-50/40 transition-all"
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Primary database line phone..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-600/10 outline-none text-sm font-semibold text-slate-700 bg-slate-50/40 font-mono transition-all"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      contact_number: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Headquarters Physical Address
                </label>
                <textarea
                  placeholder="Full structural location indices..."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-600/10 outline-none text-sm font-semibold text-slate-700 bg-slate-50/40 resize-none transition-all"
                  onChange={(event) =>
                    setFormData({ ...formData, address: event.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 uppercase tracking-wider transition-all active:bg-slate-50"
                >
                  Abort Action
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin stroke-[2.5]" />
                  ) : (
                    "Commit Supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Settlement Remittance Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm border border-slate-100 shadow-xl overflow-hidden transform animate-slide-up">
            <div className="p-5 border-b border-slate-100 text-center bg-slate-50/40">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
                <Wallet size={18} className="stroke-[2.5]" />
              </div>
              <h2 className="font-black text-xs uppercase tracking-wider text-slate-900">
                Record Remittance
              </h2>
              <p className="text-sm font-extrabold text-slate-500 mt-1">
                Settling:{" "}
                <span className="text-slate-800">{showPayModal.name}</span>
              </p>
            </div>

            <form onSubmit={handlePayment} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block text-center">
                  Remittance Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    autoFocus
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border-b-4 border-slate-200 p-4 pl-10 text-center text-xl font-black text-amber-600 outline-none focus:border-amber-500 bg-slate-50/20 tracking-tight"
                    value={payAmount}
                    onChange={(event) => setPayAmount(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2
                      size={15}
                      className="animate-spin mx-auto stroke-[2.5]"
                    />
                  ) : (
                    "Authorize Transaction"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="w-full py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50 rounded-xl transition-all"
                >
                  Discard Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
