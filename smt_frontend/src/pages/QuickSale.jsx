import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
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
  const roundMoney = (value) =>
    Number.parseFloat((Number(value) || 0).toFixed(2));
  const toNumber = (value) => Number.parseFloat(value || 0);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState("0.00");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
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
      } finally {
        setIsBootLoading(false);
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
                subtotal: roundMoney((item.quantity + 1) * item.unit_price),
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
          unit_price: toNumber(product.price_per_unit),
          subtotal: roundMoney(product.price_per_unit),
          unit: product.unit,
        },
      ];
    });
  };

  const updateQuantity = (id, nextValue) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product !== id) return item;

          const product = productMap.get(id);
          const nextQuantity = Math.max(0, toNumber(nextValue));

          if (product && nextQuantity > Number(product.stock_quantity)) {
            toast.error(`Only ${product.stock_quantity} ${product.unit} available.`);
            return item;
          }

          return {
            ...item,
            quantity: nextQuantity,
            subtotal: roundMoney(nextQuantity * item.unit_price),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = useMemo(
    () => roundMoney(cart.reduce((sum, item) => sum + Number(item.subtotal), 0)),
    [cart],
  );

  const discountAmount = useMemo(() => {
    const parsedDiscount = roundMoney(discount || 0);
    return Math.min(parsedDiscount, subtotal);
  }, [discount, subtotal]);

  const total = useMemo(
    () => roundMoney(subtotal - discountAmount),
    [discountAmount, subtotal],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity), 0),
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
        total_amount: total.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        payment_type: paymentType,
        customer:
          paymentType === "credit" && selectedCustomer
            ? Number(selectedCustomer)
            : null,
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity.toFixed(2),
          unit_price: item.unit_price.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
        })),
      });

      toast.success(`Sale #SMT-${saleRes.data.id} completed.`);
      setCart([]);
      setDiscount("0.00");
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
        error.response?.data?.discount_amount?.[0] ||
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
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-4 backdrop-blur-md md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold tracking-wide text-emerald-600">
                  Counter Mode
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  Quick Sale
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Tap products to build the order. Cash can be completed in two
                  taps on desktop.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:w-[340px]">
                <div className="rounded-[1.75rem] bg-slate-900 p-4 text-white shadow-lg">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Active Total
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight">
                    ₹ {total.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Items In Cart
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight">
                    {itemCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="relative">
                <label htmlFor="quick-sale-search" className="sr-only">
                  Search products
                </label>
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  id="quick-sale-search"
                  type="text"
                  placeholder="Search fruits by name..."
                  className="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-3.5 pl-12 pr-4 font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("cash")}
                  aria-pressed={paymentType === "cash"}
                  className={`smt-touch-target flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
                    paymentType === "cash"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                      : "bg-white text-slate-500"
                  }`}
                >
                  <CheckCircle size={16} /> Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("credit")}
                  aria-pressed={paymentType === "credit"}
                  className={`smt-touch-target flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
                    paymentType === "credit"
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                      : "bg-white text-slate-500"
                  }`}
                >
                  <CreditCard size={16} /> Credit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 lg:pb-6">
          {isBootLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-[1.75rem] bg-slate-200"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  disabled={Number(product.stock_quantity) <= 0}
                  onClick={() => addToCart(product)}
                  aria-label={`Add ${product.name} to cart`}
                  className={`relative flex min-h-40 flex-col overflow-hidden rounded-[1.75rem] border-2 p-4 text-left transition-all active:scale-95 ${
                    Number(product.stock_quantity) <= 0
                      ? "border-slate-100 bg-slate-50 opacity-60"
                      : "border-slate-100 bg-white hover:border-emerald-500 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        Number(product.stock_quantity) <= 5
                          ? "bg-rose-50 text-rose-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Stock {product.stock_quantity}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Plus size={18} />
                    </div>
                  </div>
                  <div className="mt-5 flex-1">
                    <span className="line-clamp-2 text-base font-black leading-tight text-slate-900">
                      {product.name}
                    </span>
                    <span className="mt-2 block text-2xl font-black tracking-tight text-emerald-600">
                      ₹ {product.price_per_unit}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 text-sm font-semibold text-slate-500">
                    <span>{product.unit}</span>
                    {Number(product.stock_quantity) <= 0 ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Tap to add
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center">
              <AlertCircle size={40} className="text-slate-300" />
              <p className="mt-4 text-lg font-black text-slate-800">
                No products match this search
              </p>
              <p className="mt-2 max-w-sm text-sm font-semibold text-slate-500">
                Try a shorter product name or clear the search to view the full
                inventory.
              </p>
            </div>
          )}
        </div>
      </div>

      {!showCartMobile && cart.length > 0 && (
        <div className="animate-in slide-in-from-bottom-10 fixed bottom-24 left-4 right-4 lg:hidden">
          <button
            type="button"
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
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  View Cart
                </p>
                <p className="text-lg font-black">₹ {total.toFixed(2)}</p>
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
          <button
            type="button"
            onClick={() => setShowCartMobile(false)}
            aria-label="Close cart review"
            className="p-2 -ml-2"
          >
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
          <div className="rounded-[1.75rem] bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Order Snapshot
            </p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Items</p>
                <p className="text-2xl font-black text-slate-900">{itemCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500">
                  Grand Total
                </p>
                <p className="text-4xl font-black tracking-tight text-slate-900">
                  ₹ {total.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Subtotal</span>
                <span className="font-black text-slate-900">
                  ₹ {subtotal.toFixed(2)}
                </span>
              </div>
              <div>
                <label
                  htmlFor="quick-sale-discount"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                >
                  Total Discount
                </label>
                <input
                  id="quick-sale-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-black text-slate-900 outline-none focus:border-emerald-500"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                {discountAmount !== roundMoney(discount || 0) && (
                  <p className="mt-2 text-xs font-semibold text-orange-600">
                    Discount capped at the current subtotal.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Applied Discount</span>
                <span className="font-black text-rose-600">
                  -₹ {discountAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <ShoppingBag size={40} className="text-slate-300" />
              <p className="mt-4 text-lg font-black text-slate-800">
                Cart is empty
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Add products from the catalog to start building the bill.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product}
                className="group rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="mr-2 flex-1">
                    <p className="text-base font-black leading-tight text-slate-900">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      ₹ {item.unit_price} / {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500">
                      Line Total
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      ₹ {item.subtotal}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product, item.quantity - 1)}
                      aria-label={`Decrease quantity for ${item.product_name}`}
                      className="smt-touch-target flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-rose-50"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      step={item.unit === "pcs" || item.unit === "box" ? "1" : "0.01"}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-base font-black text-slate-900 outline-none focus:border-emerald-500"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.product_name}`}
                      className="smt-touch-target flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-emerald-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product, 0)}
                    className="rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wide text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 border-t border-slate-100 bg-slate-50 p-4 md:p-6">
          {paymentType === "credit" ? (
            <div>
              <label htmlFor="quick-sale-customer" className="smt-field-label">
                Credit Customer
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <select
                  id="quick-sale-customer"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Select customer for credit sale</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} (₹ {customer.balance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Cash mode is ready. Add items and complete the sale when the
              total looks right.
            </div>
          )}

          <button
            type="button"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            aria-busy={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-4xl bg-emerald-600 py-5 text-lg font-black text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Processing Sale...
              </>
            ) : (
              "COMPLETE SALE"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
