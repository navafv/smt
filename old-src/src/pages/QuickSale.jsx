import { useState, useEffect } from "react";
import api from "../api";

export default function QuickSale() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    api.get("/products/").then((res) => setProducts(res.data));
  }, []);

  useEffect(() => {
    api.get("/customers/").then((res) => setCustomers(res.data));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price_per_unit,
          subtotal: product.price_per_unit,
        },
      ]);
    }
  };

  const total = cart.reduce((sum, item) => sum + Number(item.subtotal), 0);

  const checkout = async () => {
    if (cart.length === 0) return;

    if (paymentType === "credit" && !selectedCustomer) {
      alert("Please select a customer for credit sales!");
      return;
    }

    try {
      const payload = {
        total_amount: total,
        payment_type: paymentType,
        customer: selectedCustomer || null,
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      };
      await api.post("/sales/", payload);
      alert(`Sale Recorded for ${selectedCustomer ? 'Customer' : 'Walk-in'}!`);
      setCart([]);
      setSelectedCustomer("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Checkout Failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 p-4 gap-4">
      {/* Product Selection */}
      <div className="w-2/3 bg-white rounded-2xl p-6 shadow-sm overflow-y-auto">
        <h2 className="text-2xl font-black mb-6 text-green-700">
          SMT Quick Sale
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="p-4 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <p className="font-bold text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-500">
                ₹{p.price_per_unit}/{p.unit}
              </p>
              <p className="text-xs mt-2 font-mono">
                Stock: {p.stock_quantity}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Billing */}
      <div className="w-1/3 bg-white rounded-2xl p-6 shadow-xl flex flex-col">
        <h3 className="text-xl font-bold border-b pb-4">Current Order</h3>
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.map((item) => (
            <div
              key={item.product}
              className="flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} x ₹{item.unit_price}
                </p>
              </div>
              <p className="font-bold">₹{item.subtotal}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between text-2xl font-black">
            <span>Total</span>
            <span className="text-green-600">₹{total}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Select Customer
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-gray-50 font-bold focus:ring-2 focus:ring-green-500 outline-hidden"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Walk-in / Guest Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Payment Method
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-white font-bold"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="cash">Cash Payment</option>
              <option value="credit">Credit (On Account)</option>
            </select>
          </div>

          <button
            onClick={checkout}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 shadow-lg transition-transform active:scale-95"
          >
            COMPLETE SALE
          </button>
        </div>
      </div>
    </div>
  );
}
