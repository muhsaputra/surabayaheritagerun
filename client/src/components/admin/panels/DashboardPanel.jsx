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
  ImageIcon,
  FileDown,
  Loader2,
} from "lucide-react";
import DetailModal from "../modals/DetailModal";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Menambahkan props onExport dan isExporting dari AdminDashboard
const DashboardPanel = ({ onExport, isExporting }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const data = res.data.data;
        setParticipants(data);

        const totalRevenue = data
          .filter((p) => p.paymentStatus === "paid")
          .reduce((acc, curr) => acc + (curr.pricePaid || 0), 0);

        const todayCount = data.filter((p) => {
          const date = new Date(p.createdAt).toDateString();
          const today = new Date().toDateString();
          return date === today;
        }).length;

        setStats({
          total: data.length,
          checkIn: data.filter((p) => p.isCheckedIn).length,
          revenue: totalRevenue,
          today: todayCount,
        });
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("isAdminAuthenticated");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      else if (activeFilter === "Belum Hadir") matchFilter = !p.isCheckedIn;
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
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "TOTAL PESERTA",
            value: stats.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "SUDAH CHECK-IN",
            value: stats.checkIn,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "PENDAPATAN",
            value: formatRupiah(stats.revenue),
            icon: CreditCard,
            color: "text-slate-800",
            bg: "bg-slate-100",
            isMoney: true,
          },
          {
            label: "DAFTAR HARI INI",
            value: stats.today,
            icon: CalendarClock,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                {stat.label}
              </p>
              <h3 className={`text-3xl font-black text-slate-900`}>
                {stat.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
            >
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* BARIS ACTION & SEARCH */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            {/* SEARCH & REFRESH */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <RefreshCcw size={18} />
              </button>

              {/* TOMBOL EXCEL MODERN */}
              <button
                onClick={onExport}
                disabled={isExporting}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileDown size={16} />
                )}
                {isExporting ? "Memproses..." : "Export Excel"}
              </button>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "Semua",
              "5K Run",
              "3K Walk",
              "Lunas",
              "Belum Bayar",
              "Presale",
              "Early Bird",
              "Regular",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${activeFilter === filter ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-6 w-16 text-center">No</th>
                <th className="p-6">Peserta</th>
                <th className="p-6">Kategori / Fase</th>
                <th className="p-6">Pembayaran</th>
                <th className="p-6">Waktu Daftar</th>
                <th className="p-6">Status Check-in</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-slate-300"
                      size={30}
                    />
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-10 text-center text-slate-400 font-medium"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-6 text-slate-500 font-medium text-center">
                      {idx + 1}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {p.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                            {p.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${p.category === "5K" ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                        >
                          {p.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getPhaseBadgeColor(p.registrationPhase)}`}
                        >
                          {p.registrationPhase || "Regular"}
                        </span>
                        {p.bibNumber && (
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            #{p.bibNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                        </span>
                        <p className="text-xs font-bold text-slate-700">
                          {formatRupiah(p.pricePaid)}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] text-slate-500 font-medium flex flex-col">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={10} />{" "}
                          {new Date(p.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1 opacity-60">
                          <Clock size={10} />{" "}
                          {new Date(p.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      {p.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                          <CheckCircle size={12} /> Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold border border-slate-200 opacity-60">
                          <XCircle size={12} /> Absen
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedParticipant(p);
                          setShowDetailModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-900 hover:text-white text-slate-400 transition-all"
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
