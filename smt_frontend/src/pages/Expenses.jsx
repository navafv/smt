import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
  Wallet,
} from "lucide-react";
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
      toast.error("Failed to load operations overhead parameters.");
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
    () =>
      expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please assign a valid monetary ledger balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/expenses/", {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(2),
      });
      toast.success("Overhead debit entry logged successfully.");
      setShowForm(false);
      setFormData({ title: "", category: "other", amount: "", note: "" });
      fetchExpenses();
    } catch {
      toast.error("Failed to commit expense parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Permanently strip this ledger row entry?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}/`);
      toast.success("Expense row stripped successfully.");
      fetchExpenses();
    } catch {
      toast.error("Failed to truncate data record target.");
    }
  };

  // Shared inner form markup optimized to support multiple container contexts
  const renderExpenseFormFields = () => (
    <>
      <div>
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Expense Title / Label
        </label>
        <input
          type="text"
          required
          placeholder="e.g., Warehouse Power Grid Invoice"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          value={formData.title}
          onChange={(event) =>
            setFormData({ ...formData, title: event.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Category Allocation
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 cursor-pointer"
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
          >
            <option value="rent">Rent</option>
            <option value="electricity">Utilities</option>
            <option value="transport">Logistics / Transport</option>
            <option value="salary">Payroll / Salary</option>
            <option value="packaging">Material Packaging</option>
            <option value="other">Other Overheads</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Amount (INR)
          </label>
          <input
            type="number"
            required
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold font-mono text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
            value={formData.amount}
            onChange={(event) =>
              setFormData({ ...formData, amount: event.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Operational Log Notes (Optional)
        </label>
        <textarea
          placeholder="Append processing details or verification references..."
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          value={formData.note}
          onChange={(event) =>
            setFormData({ ...formData, note: event.target.value })
          }
        />
      </div>
    </>
  );

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Functional Header Segment Layout */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Overhead Expenses
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            Monitor system debit expenditures
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-2.5 text-right shadow-xs">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Aggregated Total
          </p>
          <p className="font-mono text-lg font-black text-rose-600">
            {formatCurrencyINR(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Main Workflow Structural Split Interface */}
      <div className="md:grid md:grid-cols-12 md:gap-5 md:items-start">
        {/* PERSISTENT LEFT DESKTOP REGISTRATION WORKSPACE PANEL */}
        <div className="hidden md:block md:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs sticky top-4">
          <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-slate-100">
            <Wallet size={14} className="text-slate-400 stroke-[2.5]" />
            <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Log Outlay Entry
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderExpenseFormFields()}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-850 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-97 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin stroke-[2.5]" />
              ) : (
                "Commit Transaction"
              )}
            </button>
          </form>
        </div>

        {/* RIGHT DATA MANIFEST COLUMN PANEL */}
        <div className="space-y-4 md:col-span-8">
          {/* Action Trigger Row across mobile frames */}
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full md:hidden items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white active:scale-98 transition-all shadow-sm"
          >
            <Plus size={14} className="stroke-[3]" />
            Add Overhead Expense
          </button>

          {/* Search Index Filter Input Bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
            />
            <input
              type="text"
              placeholder="Query expense metrics via title configurations..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {/* Dynamic Content Streams Rendering Pipeline */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-rose-600 stroke-[2.5]"
              />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <Receipt
                size={36}
                className="mx-auto text-slate-300 stroke-[1.5]"
              />
              <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                No indexed overhead match current criteria
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                        {expense.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 border border-slate-200/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                          {expense.category_display || expense.category}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400">
                          {expense.date}
                        </span>
                      </div>
                      {expense.note && (
                        <p className="text-xs font-medium text-slate-400 bg-slate-50 rounded-lg p-2 mt-1.5 border border-slate-100">
                          {expense.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <p className="text-base font-black text-rose-600 font-mono tracking-tight">
                        {formatCurrencyINR(expense.amount)}
                      </p>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="mt-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
                      >
                        <Trash2 size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE COMPONENT MODAL SLIDE-UP WORKSPACE DRAWER */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-xs p-0 sm:p-4 sm:items-center md:hidden animate-fade-in">
          <div className="w-full max-w-md rounded-t-2xl bg-white border border-slate-200 shadow-xl overflow-hidden sm:rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Log New Outlay Entry
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={15} className="text-slate-500 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              {renderExpenseFormFields()}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-xl bg-slate-950 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-97 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin stroke-[2.5]" />
                  ) : (
                    "Save Transaction"
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
