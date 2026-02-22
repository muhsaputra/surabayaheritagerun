import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Loader2,
  Medal,
} from "lucide-react";

// Import Assets
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

  // --- STATE ---
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [activePrices, setActivePrices] = useState({ "5K": 0, "3K": 0 });

  // --- FETCH DATA ---
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

  // --- HELPERS ---
  const formatPrice = (price) => {
    if (!price) return "-";
    return price / 1000 + "k";
  };

  const getTimelineIcon = (name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("presale")) return <Flame size={28} />;
    if (n.includes("early")) return <Sprout size={28} />;
    return <CalendarRange size={28} />;
  };

  const getPhaseDescription = (name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("presale")) return "23 - 27 Februari 2026";
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
    <div className="font-sans text-slate-800 bg-slate-50 selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden text-white rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl h-auto min-h-[600px] md:min-h-[800px] flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Surabaya Heritage Run Hero"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="animate-fade-in-up flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md mb-8">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-white font-bold tracking-widest text-[10px] md:text-xs uppercase">
                HUT Surabaya ke-733
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 leading-tight tracking-tighter">
              SURABAYA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
                HERITAGE RUN
              </span>
            </h1>

            <p className="text-base md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
              Minggu, <span className="text-white font-bold">24 Mei 2026</span>.
              Kobarkan semangat heroisme di kawasan Eropa Kecil. Start & Finish
              di Plaza Internatio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-5 bg-red-600 text-white font-black text-sm rounded-2xl shadow-xl hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                Daftar Sekarang <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate("/check-status")}
                className="px-10 py-5 bg-white/10 text-white font-black text-sm rounded-2xl hover:bg-white hover:text-black transition-all border-2 border-white/30 backdrop-blur-sm uppercase tracking-widest"
              >
                <Ticket size={20} className="mr-2 inline" /> Cek Tiket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- INFO EVENT GRID --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 md:-mt-32 relative z-20 mb-24">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-slate-100">
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
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="font-bold text-xl text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="px-4 mx-auto max-w-6xl mb-24">
        <div className="text-center mb-16">
          <span className="text-red-600 font-black tracking-[0.3em] uppercase text-xs">
            Registration
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mt-2">
            Timeline Fase
          </h2>
        </div>

        {loadingTimeline ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelineData?.phases?.map((phase, index) => {
              const isActive = index === timelineData.activePhaseIndex;
              const isPassed = index < timelineData.activePhaseIndex;
              const totalSisa = timelineData.remaining?.totalSisa || 0;
              const percentageLeft =
                (totalSisa / (phase.limits?.["5K"] + phase.limits?.["3K"])) *
                100;

              return (
                <div
                  key={index}
                  className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${isActive ? "bg-slate-900 text-white shadow-2xl scale-105" : "bg-white border-slate-200 opacity-60"}`}
                >
                  <div className="flex justify-between mb-6">
                    <div
                      className={`p-3 rounded-2xl ${isActive ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      {getTimelineIcon(phase.name)}
                    </div>
                    {isActive && (
                      <span className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-2xl mb-1 uppercase tracking-tight">
                    {phase.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
                    {getPhaseDescription(phase.name)}
                  </p>

                  {isActive && (
                    <div className="mt-auto bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase">
                        <span className="text-slate-400">Kuota Tersisa</span>
                        <span
                          className={
                            totalSisa < 10 ? "text-red-500" : "text-white"
                          }
                        >
                          {totalSisa}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all duration-1000"
                          style={{ width: `${percentageLeft}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- KATEGORI RUN Section --- */}
      <div className="relative py-32 overflow-hidden bg-slate-900 rounded-[3rem] md:rounded-[5rem] mx-2 md:mx-6 mb-24">
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroImage}
            className="w-full h-full object-cover grayscale"
            alt="background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#450a0a] via-slate-900/90 to-slate-900"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-xs">
              Categories
            </span>
            <h2 className="text-5xl md:text-7xl font-serif font-black text-white mt-4 italic">
              Kategori <span className="text-[#D4AF37]">Run</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* 5K */}
            <div className="bg-[#9B1B1B] p-10 rounded-[3rem] border border-[#D4AF37]/20 shadow-2xl hover:-translate-y-2 transition-all">
              <div className="flex justify-between mb-12">
                <span className="bg-[#D4AF37] text-maroon-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Most Popular
                </span>
                <Medal className="text-[#D4AF37]" size={40} />
              </div>
              <h3 className="text-8xl font-serif font-black text-white mb-2">
                5K
              </h3>
              <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-8">
                Heritage Professional Run
              </p>
              <div className="space-y-4 mb-12">
                {[
                  "Jersey Eksklusif",
                  "Finisher Medal",
                  "BIB Number",
                  "Refreshments",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-white/80 text-sm"
                  >
                    <CheckCircle size={16} className="text-[#D4AF37]" /> {item}
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">
                  {formatPrice(activePrices["5K"])}
                </span>
                <span className="text-white/40 text-xs uppercase font-bold tracking-widest">
                  / Orang
                </span>
              </div>
              <button
                onClick={() => navigate("/register")}
                className="w-full py-5 bg-[#D4AF37] text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all"
              >
                Daftar Sekarang
              </button>
            </div>

            {/* 3K */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl hover:-translate-y-2 transition-all">
              <div className="flex justify-between mb-12">
                <span className="bg-slate-100 text-slate-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Family Choice
                </span>
                <Users className="text-slate-300" size={40} />
              </div>
              <h3 className="text-8xl font-serif font-black text-slate-900 mb-2">
                3K
              </h3>
              <p className="text-red-600 font-bold text-xs uppercase tracking-widest mb-8">
                Heritage Fun Walk
              </p>
              <div className="space-y-4 mb-12 text-slate-600">
                {[
                  "Jersey Eksklusif",
                  "Finisher Medal",
                  "BIB Number",
                  "Refreshments",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={16} className="text-red-600" /> {item}
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2 mb-8 text-slate-900">
                <span className="text-5xl font-black">
                  {formatPrice(activePrices["3K"])}
                </span>
                <span className="text-slate-400 text-xs uppercase font-bold tracking-widest">
                  / Orang
                </span>
              </div>
              <button
                onClick={() => navigate("/register")}
                className="w-full py-5 border-2 border-slate-900 text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
              >
                Daftar 3K
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- JEJAK LANGKAH --- */}
      <div className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 uppercase">
              Jejak <span className="text-red-600">Langkah</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
            {galleryImages.map((src, idx) => (
              <div
                key={idx}
                className={`relative group overflow-hidden rounded-3xl ${idx === 0 ? "col-span-2 row-span-2" : ""} ${idx === 3 ? "col-span-2" : ""}`}
              >
                <img
                  src={src}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="gallery"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION: SYARAT & KETENTUAN --- */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  <FileText size={14} /> Official Rules
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 leading-tight">
                  Syarat & <br />
                  <span className="text-red-600 italic">Ketentuan</span>
                </h2>
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <Info size={24} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                    Panitia berhak mendiskualifikasi peserta yang melanggar
                    aturan tanpa refund biaya.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <UserCheck className="text-blue-600" />,
                  title: "Kepesertaan",
                  desc: "Peserta wajib sehat fisik & mental. Usia minimal 5K adalah 12 tahun.",
                },
                {
                  icon: <Ban className="text-red-600" />,
                  title: "Refund",
                  desc: "Tiket tidak dapat diuangkan kembali atau dipindahtangankan.",
                },
                {
                  icon: <Medal className="text-amber-600" />,
                  title: "Atribut",
                  desc: "Wajib menggunakan Jersey resmi dan BIB yang terlihat jelas.",
                },
                {
                  icon: <Lock className="text-slate-700" />,
                  title: "Keamanan",
                  desc: "Panitia tidak bertanggung jawab atas kehilangan barang berharga.",
                },
                {
                  icon: <MapPin className="text-red-600" />,
                  title: "Fasilitas",
                  desc: "Water station tersedia di rute ikonik kota tua.",
                },
                {
                  icon: <Clock className="text-emerald-600" />,
                  title: "Cut-Off",
                  desc: "Terdapat batas waktu lari (COT) demi keselamatan arus lalu lintas.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-red-200 hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <h4 className="font-black text-lg text-slate-900 mb-2 uppercase tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    "{item.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER MODERN --- */}
      <footer className="bg-slate-900 pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-white/10 pb-12">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-2xl font-serif font-black text-white tracking-tighter leading-none mb-2">
                SURABAYA <span className="text-red-600">HERITAGE</span> RUN
              </h3>
              <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 italic">
                The Soul of Surabaya • 2026
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {[
                { name: "Kebijakan Privasi", to: "/privacy-policy" },
                { name: "Bantuan Teknis", to: "/contact-support" },
                { name: "Cek Status", to: "/check-status" },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className="text-white/50 hover:text-[#D4AF37] text-[11px] font-black uppercase tracking-widest transition-all hover:-translate-y-1"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Surabaya Heritage Run. Built with Excellence.
            </p>
            <div className="flex items-center gap-4 opacity-30 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <p className="text-white text-[9px] font-black uppercase tracking-[0.4em]">
                HUT Surabaya 733
              </p>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- STYLES --- */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
