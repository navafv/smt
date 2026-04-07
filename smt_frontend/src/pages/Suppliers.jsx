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
        `Payment of ₹${payAmount} recorded for ${showPayModal.name}`,
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
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">{suppliers.length} partners</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-4 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2 active:scale-98"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or contact..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Building2 size={40} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">No suppliers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 size={16} className="text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {supplier.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                    <Phone size={12} />
                    {supplier.contact_number}
                  </p>
                  {supplier.address && (
                    <p className="text-xs text-gray-400 mt-1">
                      {supplier.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p
                    className={`text-lg font-bold ${Number(supplier.balance) > 0 ? "text-amber-600" : "text-green-600"}`}
                  >
                    ₹{parseFloat(supplier.balance).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPayModal(supplier)}
                className="w-full mt-3 py-2 bg-amber-50 rounded-xl text-sm font-medium text-amber-700 flex items-center justify-center gap-2 active:bg-amber-100"
              >
                <Wallet size={14} />
                Record Payment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-green-600" />
                <h2 className="font-bold text-gray-900">Add Supplier</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kerala Fruit Hub"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      contact_number: event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Address (Optional)
                </label>
                <textarea
                  placeholder="Full address"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none resize-none"
                  onChange={(event) =>
                    setFormData({ ...formData, address: event.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 active:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium flex items-center justify-center active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="p-4 border-b border-gray-100 text-center">
              <h2 className="font-bold text-gray-900">Record Payment</h2>
              <p className="text-sm text-gray-500 mt-1">{showPayModal.name}</p>
            </div>

            <form onSubmit={handlePayment} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-lg"
                  value={payAmount}
                  onChange={(event) => setPayAmount(event.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 active:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-medium flex items-center justify-center active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Confirm"
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
