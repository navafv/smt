import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Loader2,
  Printer,
  Search,
  Share2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import api from "../api";
import { formatCurrencyINR } from "../utils/currency";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales/");
      setSales(res.data);
    } catch {
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = useMemo(
    () =>
      sales.filter(
        (sale) =>
          sale.id.toString().includes(searchTerm) ||
          (sale.customer_name &&
            sale.customer_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      ),
    [sales, searchTerm],
  );

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => {
      setIsPrinting(false);
      toast.success("Print dialog opened");
    }, 600);
  };

  const handleShare = async () => {
    if (!receiptRef.current || isSharing || !selectedSale) {
      return;
    }

    setIsSharing(true);
    toast.loading("Generating receipt...", { id: "share-receipt" });

    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 4,
        canvasWidth: receiptRef.current.offsetWidth * 3,
        canvasHeight: receiptRef.current.offsetHeight * 3,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `Receipt-${selectedSale.id}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt #${selectedSale.id}`,
        });
        toast.success("Receipt shared", { id: "share-receipt" });
      } else {
        const link = document.createElement("a");
        link.download = `Receipt-${selectedSale.id}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Receipt downloaded", { id: "share-receipt" });
      }
    } catch {
      toast.error("Failed to generate receipt", { id: "share-receipt" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sales History</h1>
        <p className="text-sm text-gray-500">{sales.length} transactions</p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by ID or customer..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No sales found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <button
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm active:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      #SMT-{sale.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        sale.payment_type === "cash"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {sale.payment_type}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <User size={12} />
                    {sale.customer_name || "Walk-in"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(sale.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrencyINR(sale.total_amount)}
                  </p>
                  {Number(sale.discount_amount) > 0 && (
                    <p className="text-xs text-red-500">
                      -{formatCurrencyINR(sale.discount_amount)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                .print-area { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; }
                .print-area * { visibility: visible !important; }
                .no-print { display: none !important; }
                @page { margin: 0; }
              }
            `}
          </style>

          <div className="animate-slide-up flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="font-bold text-gray-900">
                Receipt #{selectedSale.id}
              </h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div ref={receiptRef} className="print-area bg-white p-4">
                <div className="border-b border-gray-200 pb-4 text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    SMT FRUITS
                  </h2>
                  <p className="text-xs text-gray-500">Kannur, Kerala</p>
                </div>

                <div className="space-y-2 border-b border-gray-200 py-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order ID</span>
                    <span className="text-sm font-semibold">
                      #{selectedSale.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm">
                      {formatDate(selectedSale.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer</span>
                    <span className="text-sm">
                      {selectedSale.customer_name || "Walk-in"}
                    </span>
                  </div>
                </div>

                <div className="border-b border-gray-200 py-4">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  {selectedSale.items?.map((item) => (
                    <div
                      key={item.product}
                      className="mb-2 flex justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x {formatCurrencyINR(item.unit_price)}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatCurrencyINR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrencyINR(
                        selectedSale.items?.reduce(
                          (sum, item) => sum + Number(item.subtotal),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  {Number(selectedSale.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-red-600">
                        -{formatCurrencyINR(selectedSale.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrencyINR(selectedSale.total_amount)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Payment: {selectedSale.payment_type}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Thank you for your purchase!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 p-4">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-medium text-white active:scale-98"
              >
                {isPrinting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Printer size={16} />
                )}
                Print
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white active:scale-98"
              >
                {isSharing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Share2 size={16} />
                )}
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
