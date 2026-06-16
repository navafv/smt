import React, { useState } from "react";
import api from "../api";
import {
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Loader2,
  Download,
  AlertTriangle,
  FileText,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ExportCenter() {
  const [loadingType, setLoadingType] = useState(null);

  const handleCSVDownload = async (type, label) => {
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

      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `smt_${type}_${date}.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Export manifest for ${label} built and deployed successfully.`,
      );
    } catch {
      toast.error(
        "Failed to compile structured spreadsheet metrics data stream.",
      );
    } finally {
      setLoadingType(null);
    }
  };

  const handleJSONBackup = async () => {
    setLoadingType("backup");
    try {
      const response = await api.get("/export/backup/");
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.setAttribute("download", `SMT_Backup_${timestamp}.json`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        "Database image backup successfully captured and archived.",
      );
    } catch {
      toast.error("Failed to safely serialize system backup image.");
    } finally {
      setLoadingType(null);
    }
  };

  const ExportButton = ({ label, type, icon: IconComponent }) => {
    const isThisLoading = loadingType === type;
    return (
      <button
        disabled={loadingType !== null}
        onClick={() => handleCSVDownload(type, label)}
        className="flex items-center justify-between w-full p-4 bg-slate-50 border border-slate-200/50 rounded-xl hover:bg-slate-100/70 transition-all active:scale-99 disabled:opacity-40 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-100 text-slate-500">
            <IconComponent size={14} className="stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </span>
        </div>
        {isThisLoading ? (
          <Loader2
            size={15}
            className="animate-spin text-emerald-600 stroke-[2.5]"
          />
        ) : (
          <Download size={14} className="text-slate-400 stroke-[2.5]" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-20 select-none animate-fade-in">
      {/* Component Title Segment Layout Header */}
      <div className="border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Export Management Center
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
          Extract database ledger tables & compile system backups
        </p>
      </div>

      {/* Primary Structural Workspace Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* CSV INTERACTIVE DATA REPORTING WORKSPACE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet size={16} className="stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">
                Financial Data Sheets
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Composed via optimized structural CSV arrays
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <ExportButton
              label="Sales Ledger History"
              type="sales"
              icon={TrendingUp}
            />
            <ExportButton
              label="Stock Purchase Logs"
              type="purchases"
              icon={Database}
            />
            <ExportButton
              label="Operations Overhead Ledger"
              type="expenses"
              icon={FileText}
            />
          </div>
        </div>

        {/* SECURE SYSTEM IMAGE BACKUP CONTAINER CARD */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-950 shadow-xs flex flex-col justify-between min-h-[256px]">
          <div>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ShieldCheck size={16} className="stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-tight text-white">
                  Full System Backups
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Complete database images (JSON format)
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400 leading-relaxed mt-4">
              Compiles, packs, and extracts a complete transactional system
              snapshot containing active tracking registers for all structured
              customer metrics, supplier logs, SKU data indices, and financial
              entries.
            </p>
          </div>

          <button
            disabled={loadingType !== null}
            onClick={handleJSONBackup}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-97 shadow-xs disabled:opacity-40 mt-6 cursor-pointer"
          >
            {loadingType === "backup" ? (
              <Loader2 size={15} className="animate-spin stroke-[2.5]" />
            ) : (
              <>
                <ShieldCheck size={14} className="stroke-[2.5]" />
                Compile Environment Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPLIANCE SECURITY SYSTEM LEGAL CAPTION NOTE */}
      <div className="flex items-start gap-3 bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 shadow-xs">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200/50 text-amber-700">
          <AlertTriangle size={13} className="stroke-[2.5]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-900 leading-normal">
            <span className="font-black uppercase tracking-wide text-amber-800">
              Administrative Precautionary Context:
            </span>{" "}
            Ensure compiled database snapshots are saved on encrypted internal
            infrastructure. Generated system reports capture unencrypted
            corporate performance statistics, operational records, and personal
            account parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
