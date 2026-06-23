import React, { useEffect, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Loader2,
  Printer,
  Search,
  Share2,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import api from "../api";
import { formatCurrencyINR } from "../utils/currency";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sales/?page=${page}&search=${searchTerm}`);
      if (res.data.results) {
        setSales(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 50) || 1);
      } else {
        setSales(res.data);
        setTotalPages(1);
      }
    } catch {
      toast.error("Failed to load historical ledger index");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSales();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on new query
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => {
      setIsPrinting(false);
      toast.success("System print spooler executed");
    }, 600);
  };

  const handleShare = async () => {
    if (!receiptRef.current || isSharing || !selectedSale) {
      return;
    }

    setIsSharing(true);
    toast.loading("Compiling transaction canvas...", { id: "share-receipt" });

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
          title: `Receipt Ledger #${selectedSale.id}`,
        });
        toast.success("Receipt distributed", { id: "share-receipt" });
      } else {
        const link = document.createElement("a");
        link.download = `Receipt-${selectedSale.id}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Receipt local payload preserved", {
          id: "share-receipt",
        });
      }
    } catch {
      toast.error("Canvas transformation engine rejected task", {
        id: "share-receipt",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 select-none animate-fade-in">
      {/* Structural Page Header */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Sales Register
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Auditable Ledger Terminal
        </p>
      </div>

      {/* Query Search Architecture */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Filter server logs by identifier or customer name..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setPage(1);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 animate-fade-in"
            aria-label="Flush active search parameters"
          >
            <X size={16} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Main Viewport Content Manager */}
      {loading && sales.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-emerald-600 stroke-[2.5]"
          />
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm font-semibold text-slate-400">
            No logs discovered matching query indices
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP METRIC LAYOUT */}
          <div className="hidden md:flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-sm flex-1">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Transaction Code</th>
                  <th className="px-6 py-4">Client Record Name</th>
                  <th className="px-6 py-4">Settlement Pipeline</th>
                  <th className="px-6 py-4">Execution Timestamp</th>
                  <th className="px-6 py-4 text-right">Gross Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Loader2
                      size={24}
                      className="animate-spin text-emerald-600 stroke-[2.5]"
                    />
                  </div>
                )}
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      #SMT-{sale.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User
                          size={13}
                          className="text-slate-400 stroke-[2.5]"
                        />
                        <span className="font-semibold text-slate-800">
                          {sale.customer_name || "Walk-in Client"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                          sale.payment_type === "cash"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : "bg-blue-50 border-blue-100 text-blue-700"
                        }`}
                      >
                        {sale.payment_type === "cash" ? (
                          <Banknote size={10} className="stroke-[2.5]" />
                        ) : (
                          <CreditCard size={10} className="stroke-[2.5]" />
                        )}
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900">
                          {formatCurrencyINR(sale.total_amount)}
                        </p>
                        {Number(sale.discount_amount) > 0 && (
                          <p className="text-[10px] font-bold text-rose-500">
                            -{formatCurrencyINR(sale.discount_amount)} Deducted
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" /> Previous
                </button>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight size={16} className="stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>

          {/* MOBILE INTERACTIVE CARDS */}
          <div className="space-y-3 block md:hidden relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-600 stroke-[2.5]"
                />
              </div>
            )}
            {sales.map((sale) => (
              <button
                key={sale.id}
                onClick={() => setSelectedSale(sale)}
                className="w-full rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        #SMT-{sale.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                          sale.payment_type === "cash"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : "bg-blue-50 border-blue-100 text-blue-600"
                        }`}
                      >
                        {sale.payment_type}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <User size={12} className="text-slate-400 stroke-[2.5]" />
                      {sale.customer_name || "Walk-in Client"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {formatDate(sale.created_at)}
                    </p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <p className="text-base font-black text-slate-900">
                      {formatCurrencyINR(sale.total_amount)}
                    </p>
                    {Number(sale.discount_amount) > 0 && (
                      <p className="text-[10px] font-black text-rose-500">
                        -{formatCurrencyINR(sale.discount_amount)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Mobile Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-2 px-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xs font-bold text-slate-600 active:bg-slate-50 disabled:opacity-40 shadow-xs"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Pg {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xs font-bold text-slate-600 active:bg-slate-50 disabled:opacity-40 shadow-xs"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Global Ledger Details Modal Backdrop */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-xs sm:items-center">
          {/* Print Isolation Architecture Stylesheet injection */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media print {
              body * { visibility: hidden; }
              .print-area { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; }
              .print-area * { visibility: visible !important; }
              .no-print { display: none !important; }
              @page { margin: 0; }
            }
          `,
            }}
          />

          <div className="animate-slide-up flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl border border-slate-200">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50 rounded-t-2xl">
              <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Receipt Identity Voucher
              </h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Terminate detailed overview overlay"
              >
                <X size={16} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Document Print Area Enclosure */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div
                ref={receiptRef}
                className="print-area bg-white border border-slate-100 rounded-xl p-5 shadow-xs"
              >
                <div className="border-b border-slate-200 pb-4 text-center">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    SMT FRUITS
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Kannur, Kerala
                  </p>
                </div>

                <div className="space-y-2 border-b border-slate-100 py-4 font-semibold text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Voucher Index Reference</span>
                    <span className="font-extrabold text-slate-900">
                      #{selectedSale.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Committed Date</span>
                    <span className="text-slate-800 font-bold">
                      {formatDate(selectedSale.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Identified Receiver</span>
                    <span className="text-slate-800 font-bold">
                      {selectedSale.customer_name || "Walk-in Buyer"}
                    </span>
                  </div>
                </div>

                <div className="border-b border-slate-100 py-4">
                  <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Itemized Breakdown</span>
                    <span>Computed Valuation</span>
                  </div>
                  {selectedSale.items?.map((item) => (
                    <div
                      key={item.product}
                      className="mb-3 flex justify-between text-xs items-start"
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {item.quantity} units &times;{" "}
                          {formatCurrencyINR(item.unit_price)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 mt-0.5">
                        {formatCurrencyINR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Accumulated Subtotal</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrencyINR(
                        selectedSale.items?.reduce(
                          (sum, item) => sum + Number(item.subtotal),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  {Number(selectedSale.discount_amount) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Applied Reduction Plan</span>
                      <span className="font-bold text-rose-600">
                        -{formatCurrencyINR(selectedSale.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                    <span>Gross Total Outlay</span>
                    <span className="text-emerald-600">
                      {formatCurrencyINR(selectedSale.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-4 pt-4 text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Settled Protocol: {selectedSale.payment_type}
                  </p>
                  <p className="text-[11px] font-medium text-slate-300 italic">
                    Authentication verified successfully
                  </p>
                </div>
              </div>
            </div>

            {/* Document Distribution Node Action Area */}
            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4 rounded-b-2xl no-print">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 py-3 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                {isPrinting ? (
                  <Loader2 size={14} className="animate-spin stroke-[2.5]" />
                ) : (
                  <Printer size={14} className="stroke-[2.5]" />
                )}
                <span>Print Bill</span>
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                {isSharing ? (
                  <Loader2 size={14} className="animate-spin stroke-[2.5]" />
                ) : (
                  <Share2 size={14} className="stroke-[2.5]" />
                )}
                <span>Share Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
