import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CalendarClock,
  Eye,
  FileDown,
  Loader2,
  Filter,
} from "lucide-react";
import DetailModal from "../modals/DetailModal";
import DashboardCharts from "./DashboardCharts"; // Pastikan file ini sudah dibuat

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const DashboardPanel = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    checkIn: 0,
    revenue: 0,
    today: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/api/admin/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const data = res.data.data;
        setParticipants(data);
        const totalRevenue = data
          .filter((p) => p.paymentStatus === "paid")
          .reduce((acc, curr) => acc + (curr.pricePaid || 0), 0);
        const todayCount = data.filter(
          (p) =>
            new Date(p.createdAt).toDateString() === new Date().toDateString(),
        ).length;
        setStats({
          total: data.length,
          checkIn: data.filter((p) => p.isCheckedIn).length,
          revenue: totalRevenue,
          today: todayCount,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios({
        url: `${API_URL}/api/admin/export-excel`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SHR_Database_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Gagal", error);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nik && p.nik.includes(searchTerm));

    let matchFilter = true;
    if (activeFilter !== "Semua") {
      if (activeFilter === "Lunas") matchFilter = p.paymentStatus === "paid";
      else if (activeFilter === "Belum Bayar")
        matchFilter = p.paymentStatus !== "paid";
      else if (activeFilter === "Hadir") matchFilter = p.isCheckedIn;
      else if (activeFilter === "5K Run") matchFilter = p.category === "5K";
      else if (activeFilter === "3K Walk") matchFilter = p.category === "3K";
      else if (activeFilter === "Presale")
        matchFilter = p.registrationPhase === "Presale";
      else if (activeFilter === "Early Bird")
        matchFilter = p.registrationPhase === "Early Bird";
      else if (activeFilter === "Regular")
        matchFilter = p.registrationPhase === "Regular";
    }
    return matchSearch && matchFilter;
  });

  const getPhaseBadgeColor = (phase) => {
    const p = (phase || "").toLowerCase();
    if (p.includes("presale"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    if (p.includes("early")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 font-medium italic">
            Data Real-time Surabaya Heritage Run 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            REFRESH DATA
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            {isExporting ? "EXPORTING..." : "DOWNLOAD EXCEL"}
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Peserta",
            value: stats.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Check-in",
            value: stats.checkIn,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Pendapatan",
            value: formatRupiah(stats.revenue),
            icon: CreditCard,
            color: "text-slate-900",
            bg: "bg-slate-100",
            isMoney: true,
          },
          {
            label: "Daftar Hari Ini",
            value: stats.today,
            icon: CalendarClock,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300"
          >
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3
                className={`text-2xl font-black text-slate-900 ${stat.isMoney ? "tracking-tighter" : ""}`}
              >
                {stat.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* DASHBOARD CHARTS SECTION */}
      {!loading && <DashboardCharts participants={participants} />}

      {/* FILTER & SEARCH BOX */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari nama, email, atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Filter size={16} className="text-slate-400" />
              <div className="flex gap-1">
                {["Semua", "Lunas", "Belum Bayar", "Hadir"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                      activeFilter === f
                        ? "bg-slate-900 text-white shadow-lg"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="flex flex-wrap gap-2">
          {["5K Run", "3K Walk", "Presale", "Early Bird", "Regular"].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black border transition-all ${
                  activeFilter === chip
                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                }`}
              >
                {chip.toUpperCase()}
              </button>
            ),
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">
                  No
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                  Identitas Peserta
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">
                  Detail Lari
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                  Pembayaran
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">
                  Kehadiran
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-slate-200"
                      size={40}
                    />
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Memuat Data...
                    </p>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-20 text-center text-slate-400 font-black uppercase tracking-widest"
                  >
                    Data Kosong
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 transition-all group"
                  >
                    <td className="px-8 py-6 text-xs font-bold text-slate-300 group-hover:text-slate-900 text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">
                          {p.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm tracking-tight">
                            {p.fullName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono italic">
                            {p.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black border ${
                            p.category === "5K"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-slate-900 text-white border-slate-900"
                          }`}
                        >
                          {p.category} RUN
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          {p.jerseySize} | {p.registrationPhase}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black w-fit ${
                            p.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${p.paymentStatus === "paid" ? "bg-emerald-500 animate-pulse" : "bg-orange-500"}`}
                          />
                          {p.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                        </div>
                        <span className="text-xs font-black text-slate-700 ml-1">
                          {formatRupiah(p.pricePaid)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {p.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-100">
                          <CheckCircle size={14} /> HADIR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-50 text-slate-300 text-[9px] font-black border border-slate-100 opacity-60">
                          <XCircle size={14} /> ABSEN
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedParticipant(p);
                          setShowDetailModal(true);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedParticipant && (
        <DetailModal
          participant={selectedParticipant}
          onClose={() => setShowDetailModal(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default DashboardPanel;
