import { useState, useEffect } from "react";
import api from "../api";
import { Truck, X, Plus, Wallet } from "lucide-react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    address: "",
  });
  const [payAmount, setPayAmount] = useState("");

  const fetchSuppliers = () =>
    api.get("/suppliers/").then((res) => setSuppliers(res.data));
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post("/suppliers/", formData);
    setShowAddModal(false);
    setFormData({ name: "", contact_number: "", address: "" });
    fetchSuppliers();
  };

  const handlePayment = async () => {
    await api.post("/supplier-payments/", {
      supplier: showPayModal.id,
      amount: payAmount,
    });
    setShowPayModal(null);
    setPayAmount("");
    fetchSuppliers();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900">Suppliers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} /> New Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.contact_number}</p>
              </div>
              <Truck className="text-gray-300" size={24} />
            </div>

            <div className="p-4 bg-orange-50 rounded-xl mb-4">
              <p className="text-xs font-bold text-orange-400 uppercase">
                You Owe
              </p>
              <p className="text-2xl font-black text-orange-600">
                ₹{s.balance}
              </p>
            </div>

            <button
              onClick={() => setShowPayModal(s)}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
            >
              <Wallet size={18} /> Record Payment
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: ADD SUPPLIER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAdd}
            className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Add Supplier</h2>
              <button type="button" onClick={() => setShowAddModal(false)}>
                <X />
              </button>
            </div>
            <input
              type="text"
              placeholder="Supplier Name"
              required
              className="w-full border-2 p-3 rounded-xl mb-4"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Contact Number"
              className="w-full border-2 p-3 rounded-xl mb-4"
              onChange={(e) =>
                setFormData({ ...formData, contact_number: e.target.value })
              }
            />
            <textarea
              placeholder="Address"
              className="w-full border-2 p-3 rounded-xl mb-6"
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold"
            >
              Save Supplier
            </button>
          </form>
        </div>
      )}

      {/* MODAL: SUPPLIER PAYMENT */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Pay Supplier</h2>
            <p className="text-gray-500 mb-6 font-medium">
              Paying: {showPayModal.name}
            </p>
            <input
              type="number"
              placeholder="Enter Amount"
              className="w-full border-2 p-4 rounded-2xl text-3xl font-black mb-6"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPayModal(null)}
                className="flex-1 font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
