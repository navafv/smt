import { useState, useEffect } from "react";
import api from "../api";
import { Receipt, Plus, Trash2 } from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "other",
    amount: "",
    note: "",
  });

  const fetchExpenses = () =>
    api.get("/expenses/").then((res) => setExpenses(res.data));
  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses/", formData);
      setShowForm(false);
      setFormData({ title: "", category: "other", amount: "", note: "" });
      fetchExpenses();
    } catch {
      alert("Error saving expense");
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Delete this expense record?")) {
      await api.delete(`/expenses/${id}/`);
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Expenses</h1>
          <p className="text-gray-500 font-medium">
            Manage shop overheads and bills
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Total Monthly Outflow
          </p>
          <p className="text-3xl font-black text-red-600">
            ₹{totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="mb-8 flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
      >
        <Plus size={20} /> Record New Expense
      </button>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-4"
          >
            <h2 className="text-2xl font-black mb-4">Add Expense</h2>
            <input
              type="text"
              placeholder="Expense Title (e.g. Shop Rent)"
              required
              className="w-full border-2 p-3 rounded-xl"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="border-2 p-3 rounded-xl font-bold bg-gray-50"
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
              <input
                type="number"
                placeholder="Amount"
                required
                className="border-2 p-3 rounded-xl font-black"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>

            <textarea
              placeholder="Additional Notes"
              className="w-full border-2 p-3 rounded-xl"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXPENSE LIST */}
      <div className="grid gap-4">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{exp.title}</h3>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-500 uppercase">
                    {exp.category_display}
                  </span>
                  <span className="text-xs text-gray-400">{exp.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-xl font-black text-gray-900">₹{exp.amount}</p>
              <button
                onClick={() => deleteExpense(exp.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
