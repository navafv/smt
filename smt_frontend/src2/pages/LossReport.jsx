import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Package, Search } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { formatCurrencyINR } from "../utils/currency";

export default function LossReport() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLossData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stock-returns/");
      const lossData = res.data.filter((item) => item.return_type === "wastage");
      setEntries(lossData);
    } catch {
      toast.error("Failed to load loss records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLossData();
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.reason &&
            entry.reason.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [entries, searchTerm],
  );

  const totalLossValue = useMemo(
    () =>
      filteredEntries.reduce(
        (sum, entry) => sum + Number(entry.loss_amount),
        0,
      ),
    [filteredEntries],
  );

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Loss Report</h1>
          <p className="text-sm text-gray-500">Spoilage & wastage</p>
        </div>
        <div className="rounded-xl bg-red-50 px-4 py-2">
          <p className="text-xs text-gray-500">Total Lost</p>
          <p className="font-bold text-red-600">
            {formatCurrencyINR(totalLossValue)}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by product or reason..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-red-600" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <CheckCircle2 size={40} className="mx-auto text-green-500" />
          <p className="mt-2 text-gray-500">No losses recorded</p>
          <p className="mt-1 text-xs text-gray-400">Inventory is healthy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                      <Package size={16} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {entry.product_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Quantity lost:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {entry.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Reason:</span>
                      <span className="text-sm text-gray-600">
                        {entry.reason || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    -{formatCurrencyINR(entry.loss_amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
