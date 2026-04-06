import React, { useEffect, useState, useMemo } from "react";
import {
  Truck,
  Search,
  Calendar,
  ChevronRight,
  Package,
  ShoppingBag,
  X,
  Loader2,
  ArrowLeft,
  Hash,
  Filter,
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

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
      toast.error("Failed to fetch supply records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Filter by Supplier Name or Purchase ID
  const filteredPurchases = useMemo(() => {
    return purchases.filter(
      (p) =>
        (p.supplier_name &&
          p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.id.toString().includes(searchTerm),
    );
  }, [searchTerm, purchases]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          Purchase Ledger
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {purchases.length} Inward Deliveries Recorded
        </p>
      </div>

      {/* --- SEARCHBAR --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by supplier or purchase ID..."
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 font-bold text-slate-700 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- LIST --- */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-tighter text-xs">
            Loading supply history...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPurchases.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPurchase(p)}
              className="group flex cursor-pointer items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      Batch #PUR-{p.id}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {p.items?.length || 0} Items
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <Package size={12} className="text-slate-300" />{" "}
                    {p.supplier_name || "Direct Purchase"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight flex items-center gap-1">
                    <Calendar size={10} /> {formatDate(p.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    ₹{p.total_amount}
                  </p>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">
                    Stock Added
                  </p>
                </div>
                <ChevronRight
                  className="text-slate-300 group-hover:text-amber-500 transition-colors"
                  size={20}
                />
              </div>
            </div>
          ))}

          {filteredPurchases.length === 0 && (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto mb-4 text-slate-200" size={64} />
              <p className="font-bold text-slate-400 italic">
                No purchase records found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                    Supply Details
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                    Order #PUR-{selectedPurchase.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8 grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Supplier
                  </p>
                  <p className="font-bold text-slate-800">
                    {selectedPurchase.supplier_name || "Direct Purchase"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Date Received
                  </p>
                  <p className="font-bold text-slate-800">
                    {formatDate(selectedPurchase.created_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Items in this Batch
                </h4>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedPurchase.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-2xl border border-slate-50 bg-white p-4"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          ₹{item.unit_price} / unit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600">
                          ₹{item.subtotal}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-end justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                    <ShoppingBag size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total Investment
                    </p>
                    <p className="text-4xl font-black text-slate-900 leading-none">
                      ₹{selectedPurchase.total_amount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
              >
                CLOSE RECORDS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
