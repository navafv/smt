import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  Wallet,
  X,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { formatCurrencyINR } from "../utils/currency";
import {
  decimalToNumber,
  decimalToString,
  sumDecimalValues,
  sanitizeDecimalInput,
} from "../utils/decimal";

const weightPresets = ["0.25", "0.50", "1.00", "2.00"];

function cartLineTotal(item) {
  const qty = decimalToNumber(item.quantity);
  const price = decimalToNumber(item.unit_price);
  // Integer math to prevent floating point drift
  return (Math.round(qty * 1000) * Math.round(price * 1000)) / 1000000;
}

export default function QuickSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

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
        toast.error("Failed to load inventory terminal metrics");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [deferredSearchTerm, products]);

  const addToCart = (product) => {
    const stock = decimalToNumber(product.stock_quantity);
    if (stock <= 0) {
      toast.error(`${product.name} has no available stock`);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product === product.id);
      const step = product.unit === "pcs" || product.unit === "box" ? 1 : 1;

      if (!existing) {
        return [
          ...currentCart,
          {
            product: product.id,
            product_name: product.name,
            quantity: String(step),
            // Initialize as string for editable inputs, defaulting to base price
            unit_price: String(decimalToNumber(product.price_per_unit)),
            unit: product.unit,
          },
        ];
      }

      const nextQuantity = decimalToNumber(existing.quantity) + step;
      if (nextQuantity > stock) {
        toast.error(`Only ${stock} ${product.unit} left in stock`);
        return currentCart;
      }

      return currentCart.map((item) =>
        item.product === product.id
          ? { ...item, quantity: String(nextQuantity) }
          : item,
      );
    });
  };

  const updateQuantity = (id, newQuantityValue) => {
    if (newQuantityValue === "") {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product === id ? { ...item, quantity: "" } : item,
        ),
      );
      return;
    }

    const cleanValue = sanitizeDecimalInput(newQuantityValue);
    const quantity = decimalToNumber(cleanValue);
    if (quantity < 0) return;

    if (quantity === 0) {
      removeFromCart(id);
      return;
    }

    const product = productMap.get(id);
    if (product && quantity > decimalToNumber(product.stock_quantity)) {
      toast.error(`Stock ceiling reached: ${product.stock_quantity} Max`);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product === id ? { ...item, quantity: cleanValue } : item,
      ),
    );
  };

  // NEW: Safely update dynamic custom unit prices
  const updatePrice = (id, newPriceValue) => {
    if (newPriceValue === "") {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product === id ? { ...item, unit_price: "" } : item,
        ),
      );
      return;
    }

    const cleanValue = sanitizeDecimalInput(newPriceValue);
    if (decimalToNumber(cleanValue) < 0) return;

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product === id ? { ...item, unit_price: cleanValue } : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item.product !== id));
  };

  const subtotal = useMemo(() => {
    const lineTotals = cart.map((item) => cartLineTotal(item));
    return sumDecimalValues(lineTotals);
  }, [cart]);

  const parsedDiscount = decimalToNumber(discount);
  const discountAmount = Math.min(parsedDiscount, subtotal);
  const total = subtotal - discountAmount;

  const handleCheckout = async () => {
    // Validate quantities
    const hasInvalidQuantities = cart.some(
      (item) => item.quantity === "" || decimalToNumber(item.quantity) <= 0,
    );
    if (hasInvalidQuantities) {
      toast.error("Please enter a valid quantity for all line items");
      return;
    }

    // Validate dynamic prices
    const hasInvalidPrices = cart.some(
      (item) => item.unit_price === "" || decimalToNumber(item.unit_price) < 0,
    );
    if (hasInvalidPrices) {
      toast.error("Please enter a valid custom price for all line items");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart contains zero checkout components");
      return;
    }

    if (paymentType === "credit" && !selectedCustomer) {
      toast.error(
        "Select a registered ledger customer account for line credit sales",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/sales/", {
        total_amount: decimalToString(total),
        discount_amount: decimalToString(discountAmount),
        payment_type: paymentType,
        customer:
          paymentType === "credit" ? parseInt(selectedCustomer, 10) : null,
        items: cart.map((item) => ({
          product: item.product,
          quantity: decimalToString(item.quantity),
          unit_price: decimalToString(item.unit_price), // Saves the custom user price
          subtotal: decimalToString(cartLineTotal(item)),
        })),
      });

      toast.success("Transaction localized and archived cleanly");
      setCart([]);
      setDiscount("");
      setSelectedCustomer("");
      setPaymentType("cash");
      setShowCart(false);

      const productsResponse = await api.get("/products/");
      setProducts(productsResponse.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Backend processing runtime rejection",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 select-none animate-fade-in">
      {/* Upper Context Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Quick Sale
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            {cart.length} active item lines
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-transform active:scale-95"
            aria-label="Open Cart Sidebar view"
          >
            <ShoppingBag size={18} className="text-white" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
              {cart.length}
            </span>
          </button>
        )}
      </div>

      {/* Input Filtering Hub */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Filter catalog lookup index..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Primary Payment Selector Switch toggles */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "cash", label: "Cash Drawer", icon: Wallet },
          { id: "credit", label: "Store Credit", icon: CreditCard },
        ].map((option) => {
          const Icon = option.icon;
          const isActive = paymentType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setPaymentType(option.id)}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-98 shadow-xs border ${
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} className="stroke-[2.5]" />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Catalog Render Matrices */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => {
            const stock = decimalToNumber(product.stock_quantity);
            const isLowStock = stock <= 5 && stock > 0;
            const isOutOfStock = stock <= 0;

            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className={`relative flex flex-col justify-between rounded-2xl border text-left p-3.5 transition-all group ${
                  isOutOfStock
                    ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed"
                    : "bg-white border-slate-200/70 shadow-xs hover:shadow-md hover:border-emerald-300 active:scale-98"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isOutOfStock
                          ? "bg-slate-200 border-slate-300 text-slate-500"
                          : isLowStock
                            ? "bg-rose-50 border-rose-100 text-rose-600 animate-pulse"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {isOutOfStock ? "Empty" : `${stock} ${product.unit}`}
                    </span>
                    {!isOutOfStock && (
                      <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Plus size={14} className="stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 font-bold text-slate-800 text-sm tracking-tight line-clamp-2">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-400 font-medium">
                    Base Price per {product.unit}
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {formatCurrencyINR(product.price_per_unit)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 py-12 text-center">
          <AlertCircle size={32} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-400">
            No matched inventory instances found
          </p>
        </div>
      )}

      {/* Cart Tray Slider Overlays */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="animate-slide-up flex max-h-[90vh] w-full lg:max-w-md flex-col rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl bg-white shadow-xl h-full">
            <div className="border-b border-slate-100 px-4 py-3.5 bg-slate-50 rounded-t-2xl lg:rounded-tr-none lg:rounded-tl-2xl flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Current Cart Basket
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {cart.length} active row declarations
                </p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-200/60 text-slate-500 transition-colors"
                aria-label="Close details tray window"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Cart Loop Scroller Area */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-slate-50/50">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart size={36} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-400">
                    Active checkout basket is empty
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product}
                    className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                          {item.product_name}
                        </h3>

                        {/* CUSTOM EDITABLE PRICE INPUT */}
                        <div className="flex items-center gap-1.5 mt-2 bg-slate-50 border border-slate-200 rounded-lg p-1 w-max">
                          <Edit2 size={12} className="text-slate-400 ml-1" />
                          <span className="text-[11px] font-black text-slate-500">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={item.unit_price}
                            onChange={(e) =>
                              updatePrice(item.product, e.target.value)
                            }
                            className="w-16 bg-transparent text-xs font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                          />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-2">
                            / {item.unit}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Purge line element target item"
                      >
                        <X size={14} className="stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                        <button
                          onClick={() => {
                            const step =
                              item.unit === "pcs" || item.unit === "box"
                                ? 1
                                : 0.25;
                            const currentQty = decimalToNumber(item.quantity);
                            updateQuantity(
                              item.product,
                              Math.max(0, currentQty - step).toString(),
                            );
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 active:bg-slate-100 shadow-2xs"
                        >
                          <Minus size={12} className="stroke-[2.5]" />
                        </button>

                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.product, e.target.value)
                          }
                          className="w-14 bg-transparent font-bold text-slate-800 text-center text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          onClick={() => {
                            const step =
                              item.unit === "pcs" || item.unit === "box"
                                ? 1
                                : 0.25;
                            const currentQty = decimalToNumber(item.quantity);
                            updateQuantity(
                              item.product,
                              (currentQty + step).toString(),
                            );
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 active:bg-slate-100 shadow-2xs"
                        >
                          <Plus size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                      <p className="font-black text-slate-900 text-sm">
                        {formatCurrencyINR(cartLineTotal(item))}
                      </p>
                    </div>

                    {item.unit !== "pcs" && item.unit !== "box" && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-0.5">
                        {weightPresets.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => updateQuantity(item.product, preset)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            {preset} kg
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Calculations Baseboard */}
            {cart.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-400">Markdown Deductions</span>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                    <span className="text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="text"
                      value={discount}
                      placeholder="0"
                      onChange={(e) =>
                        setDiscount(sanitizeDecimalInput(e.target.value))
                      }
                      className="w-20 bg-transparent text-right text-xs font-black text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-extrabold text-slate-800 text-sm">
                    Aggregate Payable
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {formatCurrencyINR(total)}
                  </span>
                </div>

                {paymentType === "credit" && (
                  <div className="relative mt-2">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
                    />
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-slate-700 focus:outline-none focus:border-emerald-50 appearance-none"
                    >
                      <option value="">Select Target Account Profile</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({formatCurrencyINR(c.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3.5 text-sm font-bold text-white shadow-md transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin text-white stroke-[2.5]"
                      />
                      <span>Securing Settlement Remittance...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="stroke-[2.5]" />
                      <span>Finalize Terminal Invoicing</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
