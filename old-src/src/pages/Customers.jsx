import { useState, useEffect } from "react";
import api from "../api";
import { UserPlus, X } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showPayModal, setShowPayModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // State for Add Modal

  // States for New Customer Form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [payAmount, setPayAmount] = useState("");

  const fetchCustomers = () =>
    api.get("/customers/").then((res) => setCustomers(res.data));
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Function to create a new customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/customers/", newCustomer);
      setShowAddModal(false);
      setNewCustomer({ name: "", phone: "", address: "" });
      fetchCustomers();
      alert("Customer Added Successfully!");
    } catch (err) {
      alert(
        err.response?.data?.phone
          ? "Phone number already exists!"
          : "Error adding customer",
      );
    }
  };

  const handlePayment = async () => {
    try {
      await api.post("/customer-payments/", {
        customer: showPayModal.id,
        amount: payAmount,
      });
      setShowPayModal(null);
      setPayAmount("");
      fetchCustomers();
      alert("Payment Recorded!");
    } catch {
      alert("Error recording payment");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900">Customers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <UserPlus size={20} /> Add Customer
        </button>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
            <p className="text-sm text-gray-500">{c.phone}</p>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Current Balance
              </p>
              <p
                className={`text-2xl font-black ${c.balance > 0 ? "text-red-500" : "text-green-600"}`}
              >
                ₹{c.balance}
              </p>
            </div>

            <button
              onClick={() => setShowPayModal(c)}
              className="w-full mt-4 bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition"
            >
              Receive Payment
            </button>
          </div>
        ))}
      </div>

      {/* --- MODAL: ADD CUSTOMER --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">
                New Customer
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-hidden transition-colors"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-hidden transition-colors"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Address (Optional)
                </label>
                <textarea
                  className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-hidden transition-colors"
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
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECEIVE PAYMENT (Existing) --- */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-2 text-gray-800">
              Receive Payment
            </h2>
            <p className="text-gray-500 mb-6">
              Settling account for{" "}
              <span className="font-bold text-gray-700">
                {showPayModal.name}
              </span>
            </p>

            <div className="relative mb-6">
              <span className="absolute left-4 top-4 font-bold text-gray-400 text-xl">
                ₹
              </span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full border-2 border-gray-100 p-4 pl-10 rounded-2xl text-3xl font-black text-green-600 focus:border-green-500 outline-hidden"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayModal(null)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100"
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
