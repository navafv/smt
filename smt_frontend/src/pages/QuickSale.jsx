import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

export default function QuickSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(term),
    );
  }, [deferredSearchTerm, products]);

  const addToCart = (product) => {
    if (Number(product.stock_quantity) <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product === product.id);
      if (existing) {
        if (existing.quantity >= Number(product.stock_quantity)) {
          toast.error(`Only ${product.stock_quantity} ${product.unit} available.`);
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
          unit_price: Number(product.price_per_unit),
          subtotal: Number(product.price_per_unit),
          unit: product.unit,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product !== id) return item;

          const product = productMap.get(id);
          const nextQuantity = Math.max(0, item.quantity + delta);

          if (product && nextQuantity > Number(product.stock_quantity)) {
            toast.error(`Only ${product.stock_quantity} ${product.unit} available.`);
            return item;
          }

          return {
            ...item,
            quantity: nextQuantity,
            subtotal: nextQuantity * item.unit_price,
          };
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
      toast.error("Select a customer for credit sales.");
      return;
    }

    setIsSubmitting(true);
    try {
      const saleRes = await api.post("/sales/", {
        total_amount: total,
        payment_type: paymentType,
        customer: selectedCustomer || null,
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      });

      toast.success(`Sale #SMT-${saleRes.data.id} completed.`);
      setCart([]);
      setSelectedCustomer("");
      setPaymentType("cash");
      setShowCartMobile(false);

      try {
        const productRes = await api.get("/products/");
        setProducts(productRes.data);
      } catch {
        toast.error("Sale saved, but inventory refresh failed. Reload the page.");
      }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.customer?.[0] ||
        error.response?.data?.items?.[0] ||
        error.response?.data?.quantity?.[0] ||
        "Transaction failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-80px)] overflow-hidden">
      <div
        className={`flex h-full flex-col transition-all duration-300 ${showCartMobile ? "hidden lg:flex" : "flex"} lg:mr-100`}
      >
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-4 md:p-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search fruits..."
              className="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-3 pl-12 pr-4 font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white md:py-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 lg:pb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                disabled={Number(product.stock_quantity) <= 0}
                onClick={() => addToCart(product)}
                className={`relative flex h-36 flex-col overflow-hidden rounded-3xl border-2 p-3 text-left transition-all active:scale-95 md:h-40 md:p-4 ${
                  Number(product.stock_quantity) <= 0
                    ? "border-slate-100 bg-slate-50 opacity-60"
                    : "border-slate-50 bg-white hover:border-emerald-500 hover:shadow-lg"
                }`}
              >
                <div className="flex-1">
                  <span className="line-clamp-2 text-xs font-black uppercase leading-tight text-slate-800 md:text-sm">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-base font-black text-emerald-600 md:text-xl">
                    ₹{product.price_per_unit}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    Stock: {product.stock_quantity}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!showCartMobile && cart.length > 0 && (
        <div className="animate-in slide-in-from-bottom-10 fixed bottom-24 left-4 right-4 lg:hidden">
          <button
            onClick={() => setShowCartMobile(true)}
            className="flex w-full items-center justify-between rounded-3xl bg-slate-900 p-4 text-white shadow-2xl ring-4 ring-white"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={24} className="text-emerald-400" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black">
                  {cart.length}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase leading-none text-slate-400">
                  View Cart
                </p>
                <p className="text-lg font-black">₹{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-black uppercase text-emerald-400">
              Checkout <ChevronLeft className="rotate-180" size={18} />
            </div>
          </button>
        </div>
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col border-slate-100 bg-white shadow-2xl transition-transform duration-300 lg:absolute lg:w-100 lg:border-l ${
          showCartMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-4 bg-slate-900 p-4 text-white lg:hidden">
          <button onClick={() => setShowCartMobile(false)} className="p-2 -ml-2">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest">
            Review Order
          </h2>
        </div>

        <div className="hidden items-center gap-3 bg-slate-900 p-6 text-white lg:flex">
          <ShoppingCart size={20} className="text-emerald-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">
            Active Cart
          </h3>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {cart.map((item) => (
            <div
              key={item.product}
              className="group flex items-center justify-between"
            >
              <div className="mr-4 flex-1">
                <p className="text-sm font-black uppercase leading-tight text-slate-800 md:text-base">
                  {item.product_name}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  ₹{item.unit_price} / {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-1.5">
                <button
                  onClick={() => updateQuantity(item.product, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-rose-50"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-black">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-emerald-50"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="ml-4 w-16 text-right text-sm font-black text-slate-800">
                ₹{item.subtotal}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-slate-100 bg-slate-50 p-4 md:p-6">
          <div className="mb-2 flex items-end justify-between px-1">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Grand Total
            </span>
            <span className="text-3xl font-black tracking-tighter text-slate-900 md:text-4xl">
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
                className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm font-bold outline-none focus:border-emerald-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} (₹{customer.balance})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentType("cash")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-[10px] font-black transition-all md:text-xs ${paymentType === "cash" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-400"}`}
              >
                <CheckCircle size={14} /> CASH
              </button>
              <button
                onClick={() => setPaymentType("credit")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-[10px] font-black transition-all md:text-xs ${paymentType === "credit" ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-400"}`}
              >
                <CreditCard size={14} /> CREDIT
              </button>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            className="flex w-full items-center justify-center gap-3 rounded-4xl bg-emerald-600 py-5 text-lg font-black text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "COMPLETE SALE"}
          </button>
        </div>
      </div>
    </div>
  );
}
