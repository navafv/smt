import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  ChevronRight,
  CreditCard,
  Hash,
  History,
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
import { formatDateTimeIST } from "../utils/datetime";

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
      toast.error("Failed to fetch sales ledger.");
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
            sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [searchTerm, sales],
  );

  const formatDate = (dateString) => formatDateTimeIST(dateString);

  const handlePrint = () => {
    setIsPrinting(true);
    toast.loading("Opening print dialog...", { id: "print-sale" });
    window.print();
    window.setTimeout(() => {
      setIsPrinting(false);
      toast.success("Print dialog opened.", { id: "print-sale" });
    }, 600);
  };

  const handleShare = async () => {
    if (!receiptRef.current || isSharing || !selectedSale) return;

    setIsSharing(true);
    toast.loading("Generating receipt image...", { id: "share-sale" });

    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        fontEmbedCSS: "",
        pixelRatio: 3,
        width: 380,
        style: {
          margin: "0",
          padding: "20px",
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `SMT-Receipt-${selectedSale.id}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt #SMT-${selectedSale.id}`,
        });
        toast.success("Receipt shared successfully.", { id: "share-sale" });
      } else {
        const link = document.createElement("a");
        link.download = `SMT-Receipt-${selectedSale.id}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Receipt image downloaded.", { id: "share-sale" });
      }
    } catch (error) {
      console.error("Share Error:", error);
      toast.error("Could not generate receipt image.", { id: "share-sale" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-6 p-4 pb-24 md:p-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold tracking-wide text-emerald-600">
          Transaction Records
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Sales Ledger
        </h1>
        <p className="text-sm font-semibold text-slate-500">
          Tracking {sales.length} transactions with fast access to reprint and share receipts.
        </p>
      </div>

      <div className="relative group">
        <label htmlFor="sales-history-search" className="sr-only">
          Search sales by order ID or customer name
        </label>
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
          size={20}
        />
        <input
          id="sales-history-search"
          type="text"
          placeholder="Search order ID or customer name..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div
          className="flex h-64 flex-col items-center justify-center gap-4 text-slate-500"
          aria-busy="true"
        >
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold">Retrieving transactions...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <button
              key={sale.id}
              type="button"
              onClick={() => setSelectedSale(sale)}
              className="group flex w-full items-center justify-between rounded-[1.75rem] border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    sale.payment_type === "cash"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {sale.payment_type === "cash" ? (
                    <Banknote size={24} />
                  ) : (
                    <CreditCard size={24} />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      #SMT-{sale.id}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        sale.payment_type === "cash"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {sale.payment_type}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-600">
                    <User size={12} />
                    {sale.customer_name || "Walk-in Customer"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatDate(sale.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    ₹ {sale.total_amount}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Paid
                  </p>
                </div>
                <ChevronRight
                  className="text-slate-300 transition-colors group-hover:text-emerald-500"
                  size={20}
                />
              </div>
            </button>
          ))}

          {filteredSales.length === 0 && (
            <div className="py-20 text-center">
              <History className="mx-auto mb-4 text-slate-200" size={64} />
              <p className="font-bold text-slate-500">
                No transactions found for this search.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  body { visibility: hidden; }
                  .print-area {
                    visibility: visible !important;
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  .print-area * { visibility: visible !important; }
                  .no-print { display: none !important; }
                  @page { margin: 0; }
                  body { margin: 1cm; }
                }
              `,
            }}
          />

          <div className="relative flex w-full max-w-4xl flex-col gap-4 lg:flex-row">
            <button
              type="button"
              onClick={() => setSelectedSale(null)}
              aria-label="Close receipt preview"
              className="absolute right-0 top-[-3.25rem] rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            >
              <X size={24} />
            </button>

            <div
              ref={receiptRef}
              className="print-area w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 print:mx-auto print:w-[80mm]"
              style={{ width: "100%", maxWidth: "380px" }}
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">SMT FRUITS</h2>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Kannur, Kerala
                </p>
                <div className="my-4 border-b border-dashed border-slate-200" />
              </div>

              <div className="mb-6 space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>Order ID</span>
                  <span className="font-black text-slate-900">#SMT-{selectedSale.id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Date</span>
                  <span className="text-right text-slate-900">
                    {formatDate(selectedSale.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Customer</span>
                  <span className="text-right text-slate-900">
                    {selectedSale.customer_name || "Walk-in"}
                  </span>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {selectedSale.items.map((item) => (
                  <div key={item.product} className="flex justify-between gap-4 text-sm">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {item.quantity} x ₹ {item.unit_price}
                      </p>
                    </div>
                    <span className="font-black text-slate-800">₹ {item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t-2 border-slate-900 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Grand Total
                  </span>
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    ₹ {selectedSale.total_amount}
                  </span>
                </div>
                <p className="mt-4 rounded-xl bg-emerald-50 py-2 text-center text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Payment Method: {selectedSale.payment_type}
                </p>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs font-semibold italic text-slate-400">
                  Thank you for your purchase!
                </p>
                <div className="mt-4 flex h-9 w-full items-center justify-center bg-slate-50 text-[11px] font-bold text-slate-500">
                  <Hash size={10} className="mr-1" /> SMT-INFOSYS-POS-V1.0
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="rounded-[2rem] bg-white p-6 shadow-2xl">
                <p className="text-sm font-bold tracking-wide text-emerald-600">
                  Receipt Actions
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  Order #{selectedSale.id}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Reprint, share, or review the bill details before closing.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="no-print flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-black text-white"
                  >
                    {isPrinting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                    Print Bill
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="no-print flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white"
                  >
                    {isSharing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSale(null)}
                    className="no-print rounded-2xl bg-slate-100 px-4 py-4 font-black text-slate-600 transition-all hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-2xl">
                <h4 className="text-lg font-black text-slate-900">Order Summary</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900">
                      {selectedSale.customer_name || "Walk-in Customer"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Payment
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900">
                      {selectedSale.payment_type}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Items
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900">
                      {selectedSale.items.length}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900">
                      ₹ {selectedSale.total_amount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
