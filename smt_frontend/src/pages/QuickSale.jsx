import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  User,
  CreditCard,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  ChevronLeft,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function QuickSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MOBILE NAVIGATION STATE
  const [showCartMobile, setShowCartMobile] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          api.get("/products/"),
          api.get("/customers/"),
        ]);
        setProducts(prodRes.data);
        setCustomers(custRes.data);
      } catch {
        toast.error("Failed to sync store data.");
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.error("Maximum stock reached.");
          return prev;
        }
        return prev.map((item) =>
          item.product === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price_per_unit,
          subtotal: product.price_per_unit,
          unit: product.unit,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unit_price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.subtotal), 0),
    [cart],
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentType === "credit" && !selectedCustomer) {
      toast.error("Select a customer for credit sales!");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/sales/", {
        total_amount: total,
        payment_type: paymentType,
        customer: selectedCustomer || null,
        items: cart,
      });
      toast.success("Sale completed!", { icon: "💰" });
      setCart([]);
      setSelectedCustomer("");
      setPaymentType("cash");
      setShowCartMobile(false);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      toast.error("Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. PRODUCT BROWSER (Hidden on mobile when cart is open) */}
      <div
        className={`flex flex-col h-full transition-all duration-300 ${showCartMobile ? "hidden lg:flex" : "flex"} lg:mr-100`}
      >
        {/* Search Header */}
        <div className="p-4 md:p-6 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search fruits..."
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 lg:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                disabled={p.stock_quantity <= 0}
                onClick={() => addToCart(p)}
                className={`flex flex-col p-3 md:p-4 rounded-3xl border-2 transition-all active:scale-95 text-left h-36 md:h-40 relative overflow-hidden ${
                  p.stock_quantity <= 0
                    ? "bg-slate-50 border-slate-100 opacity-60"
                    : "bg-white border-slate-50 hover:border-emerald-500 hover:shadow-lg"
                }`}
              >
                <div className="flex-1">
                  <span className="text-xs md:text-sm font-black text-slate-800 line-clamp-2 uppercase leading-tight">
                    {p.name}
                  </span>
                  <span className="block text-emerald-600 font-black text-base md:text-xl mt-1">
                    ₹{p.price_per_unit}
                  </span>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                    Stock: {p.stock_quantity}
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FLOATING MOBILE CART BAR (Only visible on Mobile when cart is closed) */}
      {!showCartMobile && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-24 left-4 right-4 animate-in slide-in-from-bottom-10">
          <button
            onClick={() => setShowCartMobile(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between shadow-2xl ring-4 ring-white"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={24} className="text-emerald-400" />
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {cart.length}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none">
                  View Cart
                </p>
                <p className="font-black text-lg">₹{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-sm uppercase text-emerald-400">
              Checkout <ChevronLeft className="rotate-180" size={18} />
            </div>
          </button>
        </div>
      )}

      {/* 3. BILLING PANEL (Desktop: Fixed Side / Mobile: Fullscreen Overlay) */}
      <div
        className={`fixed lg:absolute top-0 right-0 h-full w-full lg:w-100 bg-white lg:border-l border-slate-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          showCartMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Header for Cart */}
        <div className="lg:hidden p-4 bg-slate-900 text-white flex items-center gap-4">
          <button
            onClick={() => setShowCartMobile(false)}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-black uppercase tracking-widest text-sm">
            Review Order
          </h2>
        </div>

        <div className="hidden lg:flex p-6 bg-slate-900 text-white items-center gap-3">
          <ShoppingCart size={20} className="text-emerald-400" />
          <h3 className="font-black uppercase tracking-widest text-sm">
            Active Cart
          </h3>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product}
              className="flex items-center justify-between group"
            >
              <div className="flex-1 mr-4">
                <p className="font-black text-slate-800 text-sm md:text-base leading-tight uppercase">
                  {item.product_name}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  ₹{item.unit_price} / {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => updateQuantity(item.product, -1)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 active:bg-rose-50"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-black text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product, 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 active:bg-emerald-50"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="w-16 text-right font-black text-slate-800 text-sm ml-4">
                ₹{item.subtotal}
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Customer Settings */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Grand Total
            </span>
            <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              ₹{total}
            </span>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white font-bold text-sm outline-none focus:border-emerald-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (₹{c.balance})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentType("cash")}
                className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] md:text-xs flex items-center justify-center gap-2 border-2 transition-all ${paymentType === "cash" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400"}`}
              >
                <CheckCircle size={14} /> CASH
              </button>
              <button
                onClick={() => setPaymentType("credit")}
                className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] md:text-xs flex items-center justify-center gap-2 border-2 transition-all ${paymentType === "credit" ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-400"}`}
              >
                <CreditCard size={14} /> CREDIT
              </button>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            className="w-full py-5 rounded-4xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "COMPLETE SALE"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
