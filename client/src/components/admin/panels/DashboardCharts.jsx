import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, Users, Wallet } from "lucide-react";

const DashboardCharts = ({ participants }) => {
  // Data dummy/logic untuk pendaftar 7 hari terakhir
  const trendData = [
    { name: "11 Feb", pendaftar: 0 },
    { name: "12 Feb", pendaftar: 0 },
    { name: "13 Feb", pendaftar: 0 },
    { name: "14 Feb", pendaftar: 0 },
    { name: "15 Feb", pendaftar: 0 },
    { name: "16 Feb", pendaftar: 0 },
    { name: "17 Feb", pendaftar: participants.length }, // Hari ini
  ];

  const categoryData = [
    {
      name: "5K Run",
      value: participants.filter((p) => p.category === "5K").length,
    },
    {
      name: "3K Walk",
      value: participants.filter((p) => p.category === "3K").length,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-1000">
      {/* TREN PENDAFTARAN */}
      <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase">
              Tren Pendaftar
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              7 Hari Terakhir
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="pendaftar"
                stroke="#ef4444"
                strokeWidth={4}
                fill="#ef4444"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DISTRIBUSI KATEGORI */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase">
              Kategori
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Sebaran Jarak
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: "16px", border: "none" }}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#0f172a" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
