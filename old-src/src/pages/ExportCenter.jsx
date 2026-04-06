import api from "../api";
import { FileSpreadsheet, Database, Download, ShieldCheck } from "lucide-react";

export default function ExportCenter() {
  const handleCSVDownload = async (type) => {
    try {
      const response = await api.get(`/export/csv/${type}/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `smt_${type}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("Export failed");
    }
  };

  const handleJSONBackup = async () => {
    try {
      const response = await api.get("/export/backup/");
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(response.data));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `SMT_FULL_BACKUP_${new Date().getTime()}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch {
      alert("Backup failed");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900">Data Center</h1>
        <p className="text-gray-500 font-medium">
          Export your SMT shop records or create secure backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CSV Exports Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <FileSpreadsheet size={24} />
            </div>
            <h2 className="text-xl font-bold">Spreadsheet Exports (CSV)</h2>
          </div>

          <div className="space-y-3">
            {["sales", "purchases", "expenses"].map((item) => (
              <button
                key={item}
                onClick={() => handleCSVDownload(item)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-green-50 rounded-2xl group transition-all"
              >
                <span className="font-bold capitalize text-gray-700">
                  {item} Log
                </span>
                <Download
                  size={18}
                  className="text-gray-300 group-hover:text-green-600"
                />
              </button>
            ))}
          </div>
        </div>

        {/* JSON Backup Section */}
        <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
              <Database size={24} />
            </div>
            <h2 className="text-xl font-bold">System Backup (JSON)</h2>
          </div>

          <p className="text-gray-400 text-sm mb-8">
            Create a complete snapshot of your entire SMT database including
            products, customers, suppliers, and all history.
          </p>

          <button
            onClick={handleJSONBackup}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <ShieldCheck size={20} />
            GENERATE FULL BACKUP
          </button>
        </div>
      </div>
    </div>
  );
}
