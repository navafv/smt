import React, { useState } from "react";
import api from "../api";
import {
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Loader2,
  Download,
  AlertCircle,
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

      toast.success(`${label} exported`);
    } catch {
      toast.error("Export failed");
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

      toast.success("Backup created");
    } catch {
      toast.error("Backup failed");
    } finally {
      setLoadingType(null);
    }
  };

  const ExportButton = ({ label, type, icon }) => {
    const Icon = icon;

    return (
      <button
        disabled={loadingType !== null}
        onClick={() => handleCSVDownload(type, label)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl active:bg-gray-100 disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gray-500" />
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        {loadingType === type ? (
          <Loader2 size={16} className="animate-spin text-green-600" />
        ) : (
          <Download size={16} className="text-gray-400" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export Data</h1>
        <p className="text-sm text-gray-500">Download reports & backups</p>
      </div>

      {/* CSV Export Section */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet size={20} className="text-green-600" />
          <div>
            <h2 className="font-semibold text-gray-900">Financial Reports</h2>
            <p className="text-xs text-gray-500">CSV format for Excel</p>
          </div>
        </div>

        <div className="space-y-2">
          <ExportButton
            label="Sales History"
            type="sales"
            icon={FileSpreadsheet}
          />
          <ExportButton
            label="Stock Purchases"
            type="purchases"
            icon={Database}
          />
          <ExportButton
            label="Expense Ledger"
            type="expenses"
            icon={Database}
          />
        </div>
      </div>

      {/* System Backup Section */}
      <div className="bg-gray-900 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={20} className="text-blue-400" />
          <div>
            <h2 className="font-semibold text-white">System Backup</h2>
            <p className="text-xs text-gray-400">Full data snapshot (JSON)</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Generate a complete backup of all products, customers, suppliers, and
          transactions.
        </p>

        <button
          disabled={loadingType !== null}
          onClick={handleJSONBackup}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          {loadingType === "backup" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <ShieldCheck size={18} />
              Create Backup
            </>
          )}
        </button>
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-800">
            <span className="font-bold">Security Note:</span> Keep backup files
            in a secure location. They contain sensitive business data.
          </p>
        </div>
      </div>
    </div>
  );
}
