import { useEffect, useState } from "react";
import api from "../api";
import { TrendingDown } from "lucide-react";

export default function LossReport() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/stock-returns/").then((res) => {
      // Filter for only wastage entries
      const lossData = res.data.filter(
        (item) => item.return_type === "wastage",
      );
      setEntries(lossData);
    });
  }, []);

  const totalLoss = entries.reduce(
    (sum, item) => sum + Number(item.loss_amount),
    0,
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Loss Tracking</h1>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
          <p className="text-xs font-bold text-red-400 uppercase">
            Total Value Lost
          </p>
          <p className="text-2xl font-black text-red-600">
            ₹{totalLoss.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                Date
              </th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                Product
              </th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                Qty Lost
              </th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                Value (₹)
              </th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-red-50/20 transition-colors">
                <td className="p-5 text-gray-500">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="p-5 font-bold text-gray-800">
                  {e.product_name}
                </td>
                <td className="p-5 font-medium">{e.quantity}</td>
                <td className="p-5 font-black text-red-500">
                  -₹{e.loss_amount}
                </td>
                <td className="p-5 text-gray-400 italic">
                  {e.reason || "No reason provided"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
