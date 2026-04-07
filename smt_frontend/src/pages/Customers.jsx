import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
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
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm),
      ),
    [customers, searchTerm],
  );

  const handleAddCustomer = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/customers/", newCustomer);
      toast.success(`${newCustomer.name} added`);
      setShowAddModal(false);
      setNewCustomer({ name: "", phone: "", address: "" });
      fetchCustomers();
    } catch (error) {
      toast.error(
        error.response?.data?.phone
          ? "Phone number already exists"
          : "Failed to add customer",
      );
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
      await api.post("/customer-payments/", {
        customer: showPayModal.id,
        amount: payAmount,
      });
      toast.success(
        `Received ${formatCurrencyINR(payAmount)} from ${showPayModal.name}`,
      );
      setShowPayModal(null);
      setPayAmount("");
      fetchCustomers();
    } catch {
      toast.error("Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-green-600 px-4 font-medium text-white active:scale-98"
        >
          <UserPlus size={18} />
          Add
        </button>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <User size={40} className="mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Phone size={14} /> {customer.phone}
                  </p>
                  {customer.address && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} /> {customer.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      Number(customer.balance) > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrencyINR(customer.balance)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPayModal(customer)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2 text-sm font-medium text-gray-700 active:bg-gray-100"
              >
                Receive Payment
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="animate-slide-up w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="font-bold text-gray-900">Add Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Customer name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={newCustomer.name}
                  onChange={(event) =>
                    setNewCustomer({ ...newCustomer, name: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={newCustomer.phone}
                  onChange={(event) =>
                    setNewCustomer({ ...newCustomer, phone: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address (Optional)
                </label>
                <textarea
                  placeholder="Customer address"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={newCustomer.address}
                  onChange={(event) =>
                    setNewCustomer({ ...newCustomer, address: event.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-600 active:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-green-600 py-3 font-medium text-white active:scale-98 disabled:opacity-50"
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

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="animate-slide-up w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="border-b border-gray-100 p-4 text-center">
              <h2 className="font-bold text-gray-900">Receive Payment</h2>
              <p className="mt-1 text-sm text-gray-500">{showPayModal.name}</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Amount (Rs)
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={payAmount}
                  onChange={(event) => setPayAmount(event.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-600 active:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-green-600 py-3 font-medium text-white active:scale-98 disabled:opacity-50"
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
