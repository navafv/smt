import { useEffect, useState } from "react";
import api from "../api";
import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Award,
  TrendingDown,
} from "lucide-react";

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <p className={`text-3xl font-black mt-2 ${colorClass}`}>₹{value}</p>
      </div>
      <div
        className={`p-3 rounded-2xl ${colorClass.replace("text", "bg")}/10 ${colorClass}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/").then((res) => setData(res.data));
  }, []);

  if (!data)
    return (
      <div className="p-10 text-center font-bold text-gray-400">
        Loading SMT Analytics...
      </div>
    );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900">SMT Overview</h1>
        <p className="text-gray-500 font-medium">
          Daily performance and stock insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={data.today.sales}
          icon={<TrendingUp />}
          colorClass="text-green-600"
        />
        <StatCard
          title="Purchases"
          value={data.today.purchases}
          icon={<ShoppingBag />}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Loss & Bills"
          value={Number(data.today.expenses) + Number(data.today.wastage)}
          icon={<TrendingDown />}
          colorClass="text-orange-600"
        />
        <StatCard
          title="Net Profit"
          value={data.today.profit}
          icon={<Wallet />}
          colorClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TOP PRODUCTS */}
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-yellow-500" />
            <h2 className="text-xl font-bold">Best Sellers</h2>
          </div>
          <div className="space-y-4">
            {data.top_products.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
              >
                <span className="font-bold text-gray-700">{p.name}</span>
                <span className="font-black text-xs bg-white px-3 py-1 rounded-full shadow-xs">
                  {p.sold} {p.unit} sold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              <h2 className="text-xl font-bold">Stock Alerts</h2>
            </div>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
              {data.low_stock_count} Items
            </span>
          </div>
          <div className="space-y-4">
            {data.low_stock.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 border-l-4 border-red-500 bg-red-50/30 rounded-r-2xl"
              >
                <span className="font-bold text-gray-800">{p.name}</span>
                <span className="text-red-600 font-black">
                  Only {p.stock} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
