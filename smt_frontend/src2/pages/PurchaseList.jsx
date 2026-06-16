import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Truck, X, Eye, FileText } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchases/");
      setPurchases(res.data);
    } catch {
      toast.error("Failed to sync procurement transaction indexes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          (purchase.supplier_name &&
            purchase.supplier_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          purchase.id.toString().includes(searchTerm),
      ),
    [purchases, searchTerm],
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Structural Module Header Section */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Procurement Ledger
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          {purchases.length} Registered Invoices
        </p>
      </div>

      {/* Dynamic Filter Query Element */}
      <div className="relative group">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]"
        />
        <input
          type="text"
          placeholder="Query purchase manifest via vendor string or invoice index..."
          className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Core Component State Pipeline Routing */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-amber-600 stroke-[2.5]"
          />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <Truck size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            No transaction records matched parameters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* DESKTOP MATRIX LEDGER HOUSING */}
          <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Invoice ID</th>
                  <th className="px-5 py-3.5">Supplier / Vendor Channel</th>
                  <th className="px-5 py-3.5">Settlement Date</th>
                  <th className="px-5 py-3.5 text-center">Item Density</th>
                  <th className="px-5 py-3.5 text-right">
                    Gross Total Valuation
                  </th>
                  <th className="px-5 py-3.5 text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-xs">
                {filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-extrabold text-slate-900 font-mono text-sm">
                      #{purchase.id}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-800">
                      {purchase.supplier_name || (
                        <span className="text-slate-400 font-medium italic">
                          Direct Purchase
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-medium">
                      {formatDate(purchase.created_at)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {purchase.items?.length || 0} line items
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrencyINR(purchase.total_amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 text-[11px]"
                      >
                        <Eye size={12} className="stroke-[2.5]" />
                        <span>Inspect Manifest</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STREAM SUMMARY CARDS */}
          <div className="space-y-3 block md:hidden">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm font-mono">
                        Procurement #{purchase.id}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {purchase.items?.length || 0} items
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 truncate">
                      {purchase.supplier_name || (
                        <span className="text-slate-400 font-medium italic">
                          Direct Purchase
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {formatDate(purchase.created_at)}
                    </p>
                  </div>
                  <div className="text-right pl-3">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Gross Total
                    </p>
                    <p className="text-base font-black tracking-tight mt-0.5 text-slate-900">
                      {formatCurrencyINR(purchase.total_amount)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPurchase(purchase)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-xs font-bold text-slate-700 transition-all active:bg-slate-100"
                >
                  <FileText size={13} className="stroke-[2.5]" />
                  <span>Inspect Full Line Manifest</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED MANIFEST AUDIT DIALOG PANEL */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-xs sm:items-center p-0 sm:p-4">
          <div className="animate-slide-up flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl sm:rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/40">
              <div>
                <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider font-mono">
                  Invoice #{selectedPurchase.id} Manifest
                </h2>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Processed index on {formatDate(selectedPurchase.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Scrollable Workspace */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Account Origin Partner
                </p>
                <p className="font-extrabold text-sm text-slate-800 mt-0.5">
                  {selectedPurchase.supplier_name ||
                    "Direct Cash Purchase Operations"}
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-0.5">
                  Itemized Component Index
                </h3>
                <div className="space-y-2">
                  {selectedPurchase.items?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-xs text-slate-900 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 font-mono">
                            {formatCurrencyINR(item.unit_price)} per{" "}
                            {item.unit || "unit"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black text-slate-700">
                            {item.quantity} {item.unit || "units"}
                          </p>
                          <p className="text-[11px] font-black text-emerald-600 mt-0.5">
                            {formatCurrencyINR(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Aggregate Summary Box */}
              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Total Aggregated Outflow
                  </span>
                  <span className="text-lg font-black text-slate-950 tracking-tight">
                    {formatCurrencyINR(selectedPurchase.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Controls */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/30">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full rounded-xl bg-slate-950 hover:bg-slate-850 py-3 text-xs font-bold text-white uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                Dismiss Audit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
