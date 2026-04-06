import React, { useEffect, useState, useMemo } from "react";
import {
  History,
  Search,
  Printer,
  X,
  User,
  Calendar,
  CreditCard,
  Banknote,
  ChevronRight,
  Hash,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

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

  // Filter logic: Search by ID or Customer Name
  const filteredSales = useMemo(() => {
    return sales.filter(
      (s) =>
        s.id.toString().includes(searchTerm) ||
        (s.customer_name &&
          s.customer_name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [searchTerm, sales]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handlePrint = () => {
    window.print(); // Basic print trigger
    toast.success("Sending to printer...");
  };

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          Sales Ledger
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Tracking {sales.length} Transactions
        </p>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search Order ID or Customer Name..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- SALES LIST --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold">Retrieving transactions...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className="group flex cursor-pointer items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md active:scale-[0.98]"
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      #SMT-{sale.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        sale.payment_type === "cash"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {sale.payment_type}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <User size={12} />{" "}
                    {sale.customer_name || "Walk-in Customer"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                    {formatDate(sale.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    ₹{sale.total_amount}
                  </p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">
                    Paid
                  </p>
                </div>
                <ChevronRight
                  className="text-slate-300 group-hover:text-emerald-500 transition-colors"
                  size={20}
                />
              </div>
            </div>
          ))}

          {filteredSales.length === 0 && (
            <div className="py-20 text-center">
              <History className="mx-auto mb-4 text-slate-200" size={64} />
              <p className="font-bold text-slate-400 italic">
                No transactions found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- BILL PREVIEW MODAL (THERMAL STYLE) --- */}
      {selectedSale && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col items-center">
            {/* Top Close Button (for mobile usability) */}
            <button
              onClick={() => setSelectedSale(null)}
              className="absolute -top-14 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            >
              <X size={24} />
            </button>

            {/* The Receipt "Paper" */}
            <div className="w-full bg-white p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 print:shadow-none">
              {/* Receipt Header */}
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800">
                  SMT FRUITS
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Kannur, Kerala
                </p>
                <div className="my-4 border-b border-dashed border-slate-200" />
              </div>

              {/* Order Info */}
              <div className="space-y-1 text-xs font-bold text-slate-500 mb-6">
                <div className="flex justify-between">
                  <span>ORDER ID:</span> <span>#SMT-{selectedSale.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>{" "}
                  <span>{formatDate(selectedSale.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>{" "}
                  <span className="text-slate-800">
                    {selectedSale.customer_name || "Walk-in"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-50">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {selectedSale.items.map((item) => (
                  <div
                    key={item.product}
                    className="flex justify-between text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">
                        {item.product_name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} x ₹{item.unit_price}
                      </p>
                    </div>
                    <span className="font-black text-slate-700">
                      ₹{item.subtotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t-2 border-slate-900 pt-4 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-400 uppercase">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{selectedSale.total_amount}
                  </span>
                </div>
                <p className="mt-4 text-[10px] text-center font-black text-emerald-600 bg-emerald-50 py-2 rounded-lg uppercase tracking-tighter">
                  Payment Method: {selectedSale.payment_type}
                </p>
              </div>

              {/* Receipt Footer */}
              <div className="mt-8 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase italic">
                  Thank you for your purchase!
                </p>
                <div className="mt-4 flex h-8 w-full items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400">
                  <Hash size={10} className="mr-1" /> SMT-INFOSYS-POS-V1.0
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex w-full gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
              >
                <Printer size={18} /> PRINT BILL
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 rounded-2xl bg-white py-4 font-black text-slate-400 transition-all hover:bg-slate-50"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
