import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  Wallet,
  ArrowDownRight,
  Calendar,
  Tag,
  X,
  Loader2,
  TrendingDown,
  Info,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

// Helper for category-specific icons
const getCategoryIcon = (category) => {
  switch (category) {
    case "rent":
      return <Wallet size={20} />;
    case "electricity":
      return <Info size={20} />;
    case "transport":
      return <TrendingDown size={20} />;
    default:
      return <Receipt size={20} />;
  }
};

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
      toast.error("Failed to load expense records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) =>
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0)
      return toast.error("Enter a valid amount.");

    setIsSubmitting(true);
    try {
      await api.post("/expenses/", formData);
      toast.success("Expense recorded successfully.");
      setShowForm(false);
      setFormData({ title: "", category: "other", amount: "", note: "" });
      fetchExpenses();
    } catch {
      toast.error("Failed to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Permanently delete this expense record?")) {
      try {
        await api.delete(`/expenses/${id}/`);
        toast.success("Record deleted.");
        fetchExpenses();
      } catch {
        toast.error("Deletion failed.");
      }
    }
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24">
      {/* --- HEADER & SUMMARY --- */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
            Expenses
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Shop Overheads & Bills
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-4xl border border-rose-100 bg-rose-50/50 p-4 pr-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
              Total Outflow
            </p>
            <p className="text-2xl font-black text-rose-600">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl transition-all hover:bg-black active:scale-95 md:w-auto md:px-8"
      >
        <Plus size={20} /> RECORD NEW EXPENSE
      </button>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Filter by title (e.g. Rent, Electricity)..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- EXPENSE LIST --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter">
            Calculating overheads...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-100 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                  {getCategoryIcon(exp.category)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800">{exp.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-500">
                      <Tag size={10} /> {exp.category_display}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={10} /> {exp.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-xl font-black text-slate-900">
                  ₹{exp.amount}
                </p>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-bold text-slate-300 italic">
                No matching expenses recorded.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {showForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-rose-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="text-rose-200" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Record Expense
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill, Shop Rent"
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Category
                  </label>
                  <select
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-rose-500 appearance-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-black text-rose-600 outline-none focus:border-rose-500"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Notes
                </label>
                <textarea
                  placeholder="Additional details..."
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 px-4 font-bold text-slate-700 outline-none focus:border-rose-500"
                  rows="2"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Record Outflow"
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
