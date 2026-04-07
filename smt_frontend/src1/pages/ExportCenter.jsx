import React, { useState } from "react";
import api from "../api";
import {
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Loader2,
  ShoppingCart,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDateIST, todayIST, timestampIST } from "../utils/datetime";

export default function ExportCenter() {
  const [loadingType, setLoadingType] = useState(null);

  /**
   * Robust CSV Export
   * Handles blobs to ensure data integrity for large files.
   */
  const handleCSVDownload = async (type) => {
    setLoadingType(type);
    try {
      const response = await api.get(`/export/csv/${type}/`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `smt_${type}_log_${todayIST()}.csv`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} log exported successfully!`);
    } catch {
      toast.error(`Export failed. Please check your connection.`);
    } finally {
      setLoadingType(null);
    }
  };

  /**
   * System JSON Backup
   * Encodes a full database snapshot for portability.
   */
  const handleJSONBackup = async () => {
    setLoadingType("backup");
    try {
      const response = await api.get("/export/backup/");
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SMT_FULL_BACKUP_${timestampIST()}.json`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Full system backup generated!", { icon: "🛡️" });
    } catch {
      toast.error("Critical: System backup failed.");
    } finally {
      setLoadingType(null);
    }
  };

  const ExportButton = ({ label, type, icon }) => {
    const IconComponent = icon;

    return (
      <button
        disabled={loadingType !== null}
        onClick={() => handleCSVDownload(type)}
        className="group flex w-full items-center justify-between rounded-2xl bg-slate-50 p-5 transition-all hover:bg-emerald-50 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <IconComponent size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-tight text-slate-700">
            {label}
          </span>
        </div>
        {loadingType === type ? (
          <Loader2 size={18} className="animate-spin text-emerald-600" />
        ) : (
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
          />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 p-4 md:p-0 pb-24">
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
          Data Center
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Cloud Export & Local Backups
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* --- SPREADSHEET SECTION --- */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Financial Logs
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Export to Excel/Sheets
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ExportButton
              label="Sales History"
              type="sales"
              icon={ShoppingCart}
            />
            <ExportButton
              label="Stock Purchases"
              type="purchases"
              icon={Database}
            />
            <ExportButton
              label="Expense Ledger"
              type="expenses"
              icon={TrendingDown}
            />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-slate-500">
            <Info className="mt-0.5 shrink-0" size={16} />
            <p className="text-[10px] font-bold leading-relaxed uppercase">
              CSV files are formatted for standard accounting software. Ensure
              you protect these files as they contain sensitive financial data.
            </p>
          </div>
        </div>

        {/* --- BACKUP SECTION --- */}
        <div className="flex flex-col justify-between rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                <Database size={24} />
              </div>
              <h2 className="text-xl font-black text-white">Full Snapshot</h2>
              <p className="text-xs font-bold text-blue-400/60 uppercase">
                System Backup
              </p>
            </div>

            <p className="text-sm font-medium leading-relaxed text-slate-400">
              Generate a complete JSON snapshot of your entire SMT ecosystem.
              This includes all products, customers, suppliers, and every
              historical transaction.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                Encrypted Transaction Hashes
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                Portable Data Format
              </div>
            </div>
          </div>

          <div className="mt-12">
            <button
              disabled={loadingType !== null}
              onClick={handleJSONBackup}
              className="flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-600 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
            >
              {loadingType === "backup" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  GENERATE SYSTEM BACKUP
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[10px] font-black uppercase tracking-tighter text-slate-600">
              Last backup generated: {formatDateIST(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* --- WARNING FOOTER --- */}
      <div className="flex items-center gap-4 rounded-3xl border-2 border-amber-100 bg-amber-50/50 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <AlertCircle size={20} />
        </div>
        <p className="text-xs font-bold leading-relaxed text-amber-800 uppercase">
          <span className="font-black">Security Note:</span> Generating a backup
          does not delete data from the server. Keep your backup files in a
          secure, offline location (like a USB drive) for disaster recovery.
        </p>
      </div>
    </div>
  );
}
