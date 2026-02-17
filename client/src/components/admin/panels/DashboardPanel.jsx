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
  ArrowUpRight,
} from "lucide-react";
import DetailModal from "../modals/DetailModal";

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
        `SHR2026_Database_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal ekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    let matchFilter = true;
    if (activeFilter !== "Semua") {
      if (activeFilter === "Lunas") matchFilter = p.paymentStatus === "paid";
      else if (activeFilter === "Belum Bayar")
        matchFilter = p.paymentStatus !== "paid";
      else if (activeFilter === "5K Run") matchFilter = p.category === "5K";
      else if (activeFilter === "3K Walk") matchFilter = p.category === "3K";
    }
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- BROWSER-STYLE STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            label: "Revenue",
            value: formatRupiah(stats.revenue),
            icon: CreditCard,
            color: "text-slate-900",
            bg: "bg-slate-100",
            isMoney: true,
          },
          {
            label: "Hari Ini",
            value: stats.today,
            icon: CalendarClock,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {stat.label}
            </p>
            <h3
              className={`text-2xl font-black mt-1 text-slate-900 ${stat.isMoney ? "text-xl" : ""}`}
            >
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* --- MAIN ACTION BAR --- */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 p-2 w-full lg:w-auto">
          <button
            onClick={fetchData}
            className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            {isExporting ? "Exporting..." : "Download Excel"}
          </button>
        </div>
      </div>

      {/* --- CHIP FILTERS --- */}
      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
        {["Semua", "5K Run", "3K Walk", "Lunas", "Belum Bayar"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-tighter transition-all ${activeFilter === f ? "bg-red-600 text-white shadow-md shadow-red-200" : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Peserta
                </th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Info Lari
                </th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-slate-200"
                      size={40}
                    />
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr
                    key={p._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {p.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {p.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black border ${p.category === "5K" ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                          {p.category} | {p.registrationPhase || "REGULAR"}
                        </span>
                        {p.bibNumber && (
                          <span className="font-mono text-[11px] font-bold text-slate-500 tracking-tighter">
                            #{p.bibNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold ${p.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${p.paymentStatus === "paid" ? "bg-emerald-500 animate-pulse" : "bg-orange-500"}`}
                        />
                        {p.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedParticipant(p);
                          setShowDetailModal(true);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
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
