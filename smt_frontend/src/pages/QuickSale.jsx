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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { formatCurrencyINR } from "../utils/currency";

const weightPresets = ["0.25", "0.50", "1.00", "2.00"];

function cartLineTotal(item) {
  return parseFloat(item.quantity) * parseFloat(item.unit_price);
}

export default function QuickSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
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
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
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
    if (!term) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(term),
    );
  }, [deferredSearchTerm, products]);

  const addToCart = (product) => {
    const stock = parseFloat(product.stock_quantity);
    if (stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product === product.id);

      if (!existing) {
        const quantity =
          product.unit === "pcs" || product.unit === "box" ? 1 : 0.5;
        return [
          ...currentCart,
          {
            product: product.id,
            product_name: product.name,
            quantity,
            unit_price: parseFloat(product.price_per_unit),
            unit: product.unit,
          },
        ];
      }

      const increment =
        product.unit === "pcs" || product.unit === "box" ? 1 : 0.5;
      const nextQuantity = existing.quantity + increment;

      if (nextQuantity > stock) {
        toast.error(`Only ${stock} ${product.unit} available`);
        return currentCart;
      }

      return currentCart.map((item) =>
        item.product === product.id
          ? { ...item, quantity: nextQuantity }
          : item,
      );
    });
  };

  const updateQuantity = (id, newQuantity) => {
    const product = productMap.get(id);
    const quantity = parseFloat(newQuantity);

    if (Number.isNaN(quantity) || quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter((item) => item.product !== id),
      );
      return;
    }

    if (product && quantity > parseFloat(product.stock_quantity)) {
      toast.error(`Only ${product.stock_quantity} ${product.unit} available`);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product === id ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item.product !== id));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + cartLineTotal(item), 0),
    [cart],
  );

  const discountAmount = Math.min(discount, subtotal);
  const total = subtotal - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paymentType === "credit" && !selectedCustomer) {
      toast.error("Select a customer for credit sale");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/sales/", {
        total_amount: total.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        payment_type: paymentType,
        customer: paymentType === "credit" ? parseInt(selectedCustomer, 10) : null,
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity.toFixed(2),
          unit_price: item.unit_price.toFixed(2),
          subtotal: cartLineTotal(item).toFixed(2),
        })),
      });

      toast.success("Sale completed!");
      setCart([]);
      setDiscount(0);
      setSelectedCustomer("");
      setPaymentType("cash");
      setShowCart(false);

      const productsResponse = await api.get("/products/");
      setProducts(productsResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quick Sale</h1>
          <p className="text-sm text-gray-500">{cart.length} lines in cart</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 active:scale-95"
          >
            <ShoppingBag size={20} className="text-white" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {cart.length}
            </span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search fruits..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "cash", label: "Cash", icon: Wallet },
          { id: "credit", label: "Credit", icon: CreditCard },
        ].map((option) => {
          const Icon = option.icon;
          const isActive = paymentType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setPaymentType(option.id)}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all active:scale-98 ${
                isActive
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon size={18} />
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const stock = parseFloat(product.stock_quantity);
            const isLowStock = stock <= 5;
            const isOutOfStock = stock <= 0;

            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className={`rounded-xl border bg-white p-3 text-left transition-all active:scale-98 ${
                  isOutOfStock
                    ? "border-gray-100 opacity-50"
                    : "border-gray-100 shadow-sm hover:border-green-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isLowStock
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stock} {product.unit}
                  </span>
                  <Plus size={16} className="text-green-600" />
                </div>
                <h3 className="mt-2 font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-lg font-bold text-green-600">
                  {formatCurrencyINR(product.price_per_unit)}
                </p>
                <p className="mt-2 text-xs text-gray-400">per {product.unit}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <AlertCircle size={40} className="mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No products found</p>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="animate-slide-up flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Cart ({cart.length} items)</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="flex h-10 w-10 items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart size={40} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatCurrencyINR(item.unit_price)} / {item.unit}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.product)}>
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg bg-white p-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product,
                              item.quantity - (item.unit === "pcs" ? 1 : 0.25),
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          step={item.unit === "pcs" ? 1 : 0.25}
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(item.product, parseFloat(event.target.value))
                          }
                          className="w-16 rounded-lg border border-gray-200 py-1 text-center"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product,
                              item.quantity + (item.unit === "pcs" ? 1 : 0.25),
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrencyINR(cartLineTotal(item))}
                      </p>
                    </div>

                    {item.unit !== "pcs" && item.unit !== "box" && (
                      <div className="mt-3 flex gap-2">
                        {weightPresets.map((preset) => (
                          <button
                            key={preset}
                            onClick={() =>
                              updateQuantity(item.product, parseFloat(preset))
                            }
                            className="rounded-lg bg-gray-200 px-2 py-1 text-xs active:bg-gray-300"
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

            {cart.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Rs</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(event) =>
                        setDiscount(parseFloat(event.target.value) || 0)
                      }
                      className="w-24 rounded-lg border border-gray-200 py-1 px-2 text-right"
                      min="0"
                      max={subtotal}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrencyINR(total)}
                  </span>
                </div>

                {paymentType === "credit" && (
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={selectedCustomer}
                      onChange={(event) => setSelectedCustomer(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({formatCurrencyINR(customer.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-semibold text-white active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Complete Sale
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
