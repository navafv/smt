import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Receipt, Search, Trash2, X } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "other",
    amount: "",
    note: "",
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses/");
      setExpenses(res.data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [expenses, searchTerm],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/expenses/", formData);
      toast.success("Expense recorded");
      setShowForm(false);
      setFormData({ title: "", category: "other", amount: "", note: "" });
      fetchExpenses();
    } catch {
      toast.error("Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}/`);
      toast.success("Deleted");
      fetchExpenses();
    } catch {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">Track overheads</p>
        </div>
        <div className="rounded-xl bg-red-50 px-4 py-2">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-bold text-red-600">{formatCurrencyINR(totalExpenses)}</p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-medium text-white active:scale-98"
      >
        <Plus size={18} />
        Add Expense
      </button>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search expenses..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-red-600" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <Receipt size={40} className="mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No expenses found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {expense.category_display}
                    </span>
                    <span className="text-xs text-gray-400">{expense.date}</span>
                  </div>
                  {expense.note && (
                    <p className="mt-2 text-xs text-gray-500">{expense.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrencyINR(expense.amount)}
                  </p>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 active:bg-red-50 active:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="animate-slide-up w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="font-bold text-gray-900">Add Expense</h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Electricity Bill"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData({ ...formData, category: event.target.value })
                    }
                  >
                    <option value="rent">Rent</option>
                    <option value="electricity">Utilities</option>
                    <option value="transport">Transport</option>
                    <option value="salary">Salary</option>
                    <option value="packaging">Packaging</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amount (Rs)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData({ ...formData, amount: event.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Note (Optional)
                </label>
                <textarea
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  value={formData.note}
                  onChange={(event) =>
                    setFormData({ ...formData, note: event.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-600 active:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-red-600 py-3 font-medium text-white active:scale-98 disabled:opacity-50"
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
    </div>
  );
}
