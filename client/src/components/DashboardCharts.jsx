import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

const DashboardCharts = ({ participants }) => {
  // 1. Olah Data untuk Kategori (5K vs 3K)
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

  // 2. Olah Data untuk Tren Pendaftaran (7 Hari Terakhir)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const count = participants.filter(
        (p) => new Date(p.createdAt).toDateString() === d.toDateString(),
      ).length;
      days.push({ name: dateStr, pendaftar: count });
    }
    return days;
  };

  const trendData = getLast7Days();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in duration-1000">
      {/* CHART TREN PENDAFTARAN */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Tren Pendaftaran
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              7 Hari Terakhir
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPendaftar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <YAxis hide={true} />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <Area
                type="monotone"
                dataKey="pendaftar"
                stroke="#ef4444"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorPendaftar)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART DISTRIBUSI KATEGORI */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Distribusi Kategori
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Peserta Berdasarkan Jarak
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} barSize={60}>
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
              <YAxis hide={true} />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[15, 15, 15, 15]}>
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

// Import ikon pendukung untuk di dalam chart
import { TrendingUp, Users } from "lucide-react";

export default DashboardCharts;
