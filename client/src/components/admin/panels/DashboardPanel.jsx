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
  Download,
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

  // Ambil URL API dari env atau default ke localhost
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
      // Jika error 401 (Unauthorized), tendang kembali ke login
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

  const handleExport = () => {
    const headers = [
      "No,Nama,Kategori,Fase,Email,HP,StatusBayar,CheckIn,WaktuDaftar",
    ];
    const rows = filteredParticipants.map((p, i) => {
      const safeString = (str) => `"${(str || "").replace(/"/g, '""')}"`;
      const regTime = new Date(p.createdAt).toLocaleString("id-ID");
      return [
        i + 1,
        safeString(p.fullName),
        safeString(p.category),
        safeString(p.registrationPhase || "-"),
        safeString(p.email),
        safeString(`'${p.phoneNumber}`),
        safeString(p.paymentStatus),
        safeString(p.isCheckedIn ? "Sudah" : "Belum"),
        safeString(regTime),
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Data_Peserta_HeritageRun_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <h3
                className={`text-3xl font-black ${stat.isMoney ? "text-slate-900 tracking-tight" : "text-slate-900"}`}
              >
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
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeFilter === filter ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
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
              onClick={handleExport}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-6 w-16">No</th>
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
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-10 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-6 text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {p.fullName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {p.nik || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${p.category === "5K" ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                        >
                          {p.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPhaseBadgeColor(p.registrationPhase)}`}
                        >
                          {p.registrationPhase || "Regular"}
                        </span>
                        {p.bibNumber && (
                          <span className="text-xs font-mono font-bold text-slate-700 mt-1">
                            #{p.bibNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                        </span>
                        <p className="text-xs font-bold text-slate-700">
                          {formatRupiah(p.pricePaid)}
                        </p>
                        {p.paymentStatus !== "paid" && p.paymentProof ? (
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                            <ImageIcon size={10} /> Ada Bukti
                          </span>
                        ) : p.paymentStatus !== "paid" ? (
                          <span className="text-[10px] text-slate-400 italic">
                            Belum Bayar
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs text-slate-500 font-medium flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={12} />{" "}
                          {new Date(p.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />{" "}
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                          <CheckCircle size={14} /> Check-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100 opacity-60">
                          <XCircle size={14} /> Belum Hadir
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedParticipant(p);
                          setShowDetailModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
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

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-between">
          <span>
            Menampilkan {filteredParticipants.length} dari {participants.length}{" "}
            data
          </span>
          <span>Halaman 1 dari 1</span>
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
