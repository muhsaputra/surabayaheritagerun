import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Trophy,
  CheckCircle,
  Sprout,
  CalendarRange,
  FileText,
  Ban,
  UserCheck,
  Ticket,
  Info,
  Flame,
  Users,
  Lock,
} from "lucide-react";

import heroImage from "../assets/images/GambarUtama.png";
import gallery1 from "../assets/images/gallery1.jpg";
import gallery2 from "../assets/images/gallery2.jpg";
import gallery3 from "../assets/images/gallery3.JPG";
import gallery4 from "../assets/images/gallery4.jpg";
import gallery6 from "../assets/images/foto_galeri_6.jpg";
import gallery7 from "../assets/images/gallery7.jpg";
import gallery8 from "../assets/images/gallery8.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [activePrices, setActivePrices] = useState({ "5K": 0, "3K": 0 });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const res = await axios.get(`${apiUrl}/api/landing/config`);
        if (res.data.success) {
          setTimelineData(res.data.data);
          if (res.data.data.activePrices) {
            setActivePrices(res.data.data.activePrices);
          }
        }
      } catch (error) {
        console.error("Gagal load jadwal", error);
      } finally {
        setLoadingTimeline(false);
      }
    };
    fetchConfig();
  }, []);

  const formatPrice = (price) => {
    if (!price) return "-";
    return price / 1000 + "k";
  };

  const getTimelineIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("presale")) return <Flame size={28} />;
    if (n.includes("early")) return <Sprout size={28} />;
    return <CalendarRange size={28} />;
  };

  // FUNGSI BARU: Untuk menampilkan informasi tanggal manual
  const getPhaseDescription = (name) => {
    const n = name.toLowerCase();
    if (n.includes("presale")) return "Februari 2026";
    if (n.includes("early")) return "2 - 9 Maret 2026";
    if (n.includes("regular")) return "16 Mar - 5 Apr 2026";
    return "";
  };

  const galleryImages = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery6,
    gallery7,
    gallery8,
  ];

  return (
    <div className="font-sans text-slate-800 pb-0 bg-slate-50 selection:bg-red-600 selection:text-white">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden text-white rounded-b-[2.5rem] shadow-2xl mb-16 h-auto min-h-[700px] flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-white font-bold tracking-widest text-sm uppercase">
              HUT Surabaya ke-733
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 leading-tight tracking-tighter">
            SURABAYA <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
              HERITAGE RUN
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
            Minggu, <span className="text-white font-bold">24 Mei 2026</span>.
            Start & Finish di{" "}
            <span className="text-red-500 font-bold bg-white/10 px-2 py-1 rounded">
              Plaza Internatio
            </span>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-5 bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all"
            >
              Daftar Sekarang
            </button>
            <button
              onClick={() => navigate("/check-status")}
              className="px-10 py-5 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white hover:text-black transition-all border-2 border-white/30"
            >
              Cek Tiket
            </button>
          </div>
        </div>
      </div>

      {/* --- INFO EVENT GRID --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-20 mb-24">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Calendar size={28} />,
              title: "24 Mei 2026",
              sub: "Minggu Pagi",
            },
            {
              icon: <Clock size={28} />,
              title: "06.00 WIB",
              sub: "On Time Flag Off",
            },
            {
              icon: <MapPin size={28} />,
              title: "Plaza Internatio",
              sub: "Jl. Garuda, Surabaya",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-bold text-2xl text-slate-900 mb-1">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="px-4 mx-auto max-w-6xl mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-slate-200 pb-4">
          <div>
            <span className="text-red-600 font-bold tracking-widest uppercase text-sm">
              Timeline
            </span>
            <h2 className="text-4xl font-serif font-bold text-slate-900 mt-2">
              Jadwal Pendaftaran
            </h2>
          </div>
        </div>

        {loadingTimeline ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p>Memuat Jadwal...</p>
          </div>
        ) : !timelineData || !timelineData.phases ? ( // FIX: Guarding agar tidak error phases of null
          <div className="text-center py-12 text-red-400">
            Gagal memuat jadwal pendaftaran.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelineData.phases.map((phase, index) => {
              const isActive = index === timelineData.activePhaseIndex;
              const isPassed = index < timelineData.activePhaseIndex;
              const isUpcoming = index > timelineData.activePhaseIndex;
              const totalSisa = timelineData.remaining?.totalSisa || 0;
              const totalQuota =
                (phase.limits["5K"] || 0) + (phase.limits["3K"] || 0);
              let percentageLeft =
                totalQuota > 0 ? (totalSisa / totalQuota) * 100 : 0;

              return (
                <div
                  key={index}
                  className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between min-h-[300px] ${isActive ? "bg-slate-900 text-white shadow-2xl scale-[1.02] border-slate-900 z-10" : "bg-white text-slate-900 opacity-80"}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className={`p-3 rounded-xl ${isActive ? "bg-white/10 text-red-500" : "bg-slate-100 text-slate-400"}`}
                      >
                        {getTimelineIcon(phase.name)}
                      </div>
                      {isActive && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase animate-pulse">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-2xl mb-1">{phase.name}</h3>
                    {/* INFO TANGGAL MANUAL */}
                    <div
                      className={`inline-block px-3 py-1 rounded-lg mb-4 text-xs font-bold ${isActive ? "bg-red-600/20 text-red-400" : "bg-slate-100 text-slate-500"}`}
                    >
                      {getPhaseDescription(phase.name)}
                    </div>
                  </div>

                  {isActive ? (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-300 uppercase">
                          Sisa Slot
                        </span>
                        <span className="text-xl font-black">{totalSisa}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${percentageLeft}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-100/10">
                      <p className="text-xs text-slate-400">
                        {isPassed
                          ? "Pendaftaran fase ini telah ditutup."
                          : "Menunggu giliran fase ini dibuka."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- KATEGORI LARI --- */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={heroImage}
            alt="Bg"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-6">
              Pilih Kategori Lari
            </h2>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="bg-white p-8 rounded-[2rem] flex-1 shadow-2xl">
              <h3 className="text-6xl font-black text-slate-900 mb-2">5K</h3>
              <p className="text-slate-500 font-bold uppercase mb-8">
                Heritage Run
              </p>
              <div className="text-4xl font-black text-slate-900 mb-6">
                {formatPrice(activePrices["5K"])}{" "}
                <span className="text-sm text-slate-500">/ pax</span>
              </div>
              <button
                onClick={() => navigate("/register")}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                Daftar 5K
              </button>
            </div>
            <div className="bg-white p-8 rounded-[2rem] flex-1 shadow-2xl">
              <h3 className="text-6xl font-black text-slate-900 mb-2">3K</h3>
              <p className="text-slate-500 font-bold uppercase mb-8">
                Fun Walk
              </p>
              <div className="text-4xl font-black text-slate-900 mb-6">
                {formatPrice(activePrices["3K"])}{" "}
                <span className="text-sm text-slate-500">/ pax</span>
              </div>
              <button
                onClick={() => navigate("/register")}
                className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all"
              >
                Daftar 3K
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- GALLERY & INFO LAINNYA (Diringkas agar code tidak terlalu panjang) --- */}
      <div className="py-24 bg-white text-center">
        <p className="text-slate-400 text-sm">
          © 2026 Surabaya Heritage Run. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s forwards; }
      `}</style>
    </div>
  );
};

export default LandingPage;
