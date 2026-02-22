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
  Loader2,
  Medal,
} from "lucide-react";
import { Link } from "react-router-dom"; // Pastikan Link diimport di bagian atas file
// Pastikan file fisik di folder Anda benar-benar menggunakan ekstensi ini (.png/.jpg/.JPG)
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

  // --- STATE UNTUK TIMELINE & HARGA ---
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [activePrices, setActivePrices] = useState({ "5K": 0, "3K": 0 });

  // --- 1. FETCH DATA DARI BACKEND ---
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
    <div className="font-sans text-slate-800 pb-0 bg-slate-50 selection:bg-red-600 selection:text-white">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden text-white rounded-b-[2.5rem] shadow-2xl mb-16 h-auto min-h-[700px] flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Surabaya Heritage Run Hero"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="animate-fade-in-up flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-lg mb-8 group hover:bg-white/20 transition-all">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-white font-bold tracking-widest text-sm uppercase group-hover:text-red-400 transition-colors">
                HUT Surabaya ke-733
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 leading-tight tracking-tighter drop-shadow-2xl">
              SURABAYA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white drop-shadow-lg">
                HERITAGE RUN
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              Minggu, <span className="text-white font-bold">24 Mei 2026</span>.
              Kobarkan semangat heroisme di kawasan Eropa Kecil. Start & Finish
              di
              <span className="text-red-500 font-bold bg-white/10 px-2 py-1 rounded ml-1">
                Plaza Internatio
              </span>
              .
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-5 bg-red-600 text-white font-bold text-lg rounded-xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.6)] hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Daftar Sekarang <ArrowRight size={22} strokeWidth={3} />
              </button>
              <button
                onClick={() => navigate("/check-status")}
                className="px-10 py-5 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 border-2 border-white/30 backdrop-blur-sm"
              >
                <Ticket size={22} /> Cek Tiket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- INFO EVENT GRID --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-20 mb-24">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-slate-100">
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
              className="flex flex-col items-center text-center group cursor-default"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-sm">
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
          <div className="hidden md:block text-slate-400 font-medium">
            Amankan slot sebelum habis!
          </div>
        </div>

        {loadingTimeline ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-slate-500 font-medium">
              Memuat jadwal terbaru...
            </p>
          </div>
        ) : !timelineData || !timelineData.phases ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">Jadwal pendaftaran belum tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelineData.phases.map((phase, index) => {
              const isActive = index === timelineData.activePhaseIndex;
              const isPassed = index < timelineData.activePhaseIndex;
              const isUpcoming = index > timelineData.activePhaseIndex;

              const limit5K = phase.limits?.["5K"] || 0;
              const limit3K = phase.limits?.["3K"] || 0;
              const totalQuota = limit5K + limit3K;
              const totalSisa = timelineData.remaining?.totalSisa || 0;

              let percentageLeft =
                totalQuota > 0 ? (totalSisa / totalQuota) * 100 : 0;
              if (percentageLeft > 100) percentageLeft = 100;
              if (percentageLeft < 0) percentageLeft = 0;

              const isSoldOut = isActive && totalSisa === 0;

              return (
                <div
                  key={index}
                  className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between min-h-[300px]
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xl scale-[1.02] border-slate-900 z-10 ring-4 ring-slate-100"
                      : isPassed
                        ? "bg-slate-50 text-slate-400 border-slate-200 grayscale opacity-80"
                        : "bg-white text-slate-900 border-slate-200 hover:border-red-200 hover:shadow-lg"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className={`p-3 rounded-xl transition-colors ${isActive ? "bg-white/10 text-red-500" : "bg-slate-100 text-slate-400"}`}
                      >
                        {getTimelineIcon(phase.name)}
                      </div>
                      {isActive && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-red-600/40">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-2xl mb-1">{phase.name}</h3>

                    <div
                      className={`inline-block px-3 py-1 rounded-lg mb-4 text-xs font-bold ${isActive ? "bg-red-600/20 text-red-400" : "bg-slate-100 text-slate-500"}`}
                    >
                      {getPhaseDescription(phase.name)}
                    </div>
                  </div>

                  {isActive ? (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                          <Users size={14} className="text-red-500" /> Sisa Slot
                        </span>
                        <span
                          className={`text-xl font-black ${totalSisa < 10 ? "text-red-500" : "text-white"}`}
                        >
                          {isSoldOut ? "HABIS" : totalSisa}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${percentageLeft < 20 ? "bg-red-600" : "bg-green-500"}`}
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
      {/* --- KATEGORI LARI: HERITAGE REDESIGN --- */}
      <div className="relative py-32 overflow-hidden bg-[#FDFBF7]">
        {/* Background Section with Deep Heritage Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Background Surabaya Heritage"
            loading="lazy"
            className="w-full h-full object-cover object-center grayscale-[40%] opacity-30"
          />
          {/* Overlay: Deep Maroon Gradient untuk Kedalaman Visual */}
          <div className="absolute inset-0 z-0 bg-[#450a0a]/95 mix-blend-multiply"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#450a0a] via-transparent to-[#450a0a]"></div>
        </div>

        {/* Header Section: Typography Classic */}
        <div className="text-center px-4 max-w-4xl mx-auto mb-20 relative z-10">
          <div className="inline-block mb-4">
            <span className="text-[#D4AF37] font-sans font-bold tracking-[0.5em] uppercase text-[10px] md:text-xs bg-white/5 px-4 py-2 rounded-full border border-[#D4AF37]/20 backdrop-blur-sm">
              The Soul of Surabaya.
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 drop-shadow-2xl tracking-tight">
            Kategori <span className="italic text-[#D4AF37]">Run</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50"></div>
            <Trophy className="text-[#D4AF37]" size={24} />
            <div className="w-12 h-[1px] bg-[#D4AF37]/50"></div>
          </div>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed font-sans">
            Menelusuri jejak heroisme melalui rute ikonik kota tua. Pilih
            tantanganmu dan jadilah bagian dari sejarah.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-center gap-10">
            {/* 5K Category - The "Heroic Maroon" Card */}
            <div className="group relative bg-[#9B1B1B] p-[2px] rounded-[2.5rem] flex-1 shadow-[0_30px_60px_-15px_rgba(155,27,27,0.5)] transition-all duration-500 hover:-translate-y-4">
              <div className="bg-[#9B1B1B] p-10 rounded-[2.4rem] h-full flex flex-col border border-[#D4AF37]/30">
                <div className="mb-10 flex justify-between items-start">
                  <div className="bg-[#D4AF37] text-[#450a0a] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Most Popular
                  </div>
                  <Medal className="text-[#D4AF37] animate-pulse" size={36} />
                </div>

                <div className="mb-8">
                  <h3 className="text-8xl font-serif font-black text-[#D4AF37] mb-2 leading-none tracking-tighter">
                    5K
                  </h3>
                  <p className="text-white font-sans font-bold tracking-[0.3em] uppercase text-[11px] opacity-80">
                    Heritage Professional Run
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {[
                    "Medali Finisher",
                    "Jersey Eksklusif",
                    "BIB Number",
                    "Refreshment",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-white/70 text-sm"
                    >
                      <CheckCircle size={16} className="text-[#D4AF37]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#D4AF37]/20 pt-8 mt-auto">
                  <p className="text-[#D4AF37]/60 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Investment Fee
                  </p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-6xl font-serif font-black text-white">
                      {formatPrice(activePrices["5K"])}
                    </span>
                    <span className="text-white/40 text-sm font-light">
                      / pax
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-5 bg-[#D4AF37] text-[#450a0a] font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-3 shadow-[0_15px_30px_-10px_rgba(212,175,55,0.6)]"
                  >
                    Amankan Slot <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* 3K Category - The "Antique Cream" Card */}
            <div className="group relative bg-white p-[2px] rounded-[2.5rem] flex-1 shadow-2xl transition-all duration-500 hover:-translate-y-4">
              <div className="bg-[#FDFBF7] p-10 rounded-[2.4rem] h-full flex flex-col border border-stone-200">
                <div className="mb-10 flex justify-between items-start">
                  <div className="bg-stone-100 text-[#9B1B1B] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-stone-200">
                    Family Friendly
                  </div>
                  <Users className="text-stone-300" size={36} />
                </div>

                <div className="mb-8">
                  <h3 className="text-8xl font-serif font-black text-[#9B1B1B] mb-2 leading-none tracking-tighter">
                    3K
                  </h3>
                  <p className="text-stone-400 font-sans font-bold tracking-[0.3em] uppercase text-[11px]">
                    Heritage Fun Walk
                  </p>
                </div>

                <div className="space-y-4 mb-10 text-stone-600">
                  {[
                    "Medali Finisher",
                    "Jersey Eksklusif",
                    "BIB Number",
                    "Refreshment",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-[#9B1B1B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-8 mt-auto">
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Investment Fee
                  </p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-6xl font-serif font-black text-[#9B1B1B]">
                      {formatPrice(activePrices["3K"])}
                    </span>
                    <span className="text-stone-400 text-sm font-light">
                      / pax
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-5 bg-white border-2 border-[#9B1B1B] text-[#9B1B1B] font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#9B1B1B] hover:text-white hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-3"
                  >
                    Daftar 3K <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Jejak <span className="text-red-600">Langkah</span>
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {galleryImages.map((src, idx) => (
              <div
                key={idx}
                className={`relative group overflow-hidden rounded-2xl bg-slate-200 ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""} ${idx === 3 ? "md:col-span-2" : ""}`}
              >
                <img
                  src={src}
                  alt={`Galeri ${idx}`}
                  className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION: SYARAT & KETENTUAN --- */}
      <div className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16">
            {/* Sisi Kiri: Judul & Ilustrasi */}
            <div className="md:w-1/3">
              <div className="sticky top-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <FileText size={14} /> Official Rules
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 leading-tight">
                  Syarat & <br />
                  <span className="text-red-600">Ketentuan</span>
                </h2>
                <p className="text-slate-500 leading-relaxed mb-8">
                  Demi kenyamanan dan keamanan bersama, seluruh peserta wajib
                  memahami dan mematuhi regulasi Surabaya Heritage Run 2026.
                </p>
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <Info size={20} />
                  </div>
                  <p className="text-xs text-slate-500 leading-loose">
                    Panitia berhak mendiskualifikasi peserta yang melanggar
                    aturan tanpa pengembalian biaya pendaftaran.
                  </p>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Daftar Aturan */}
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <UserCheck className="text-blue-600" />,
                  title: "Kepesertaan",
                  desc: "Peserta wajib dalam kondisi sehat fisik & mental. Usia minimal kategori 5K adalah 12 tahun.",
                },
                {
                  icon: <Ban className="text-red-600" />,
                  title: "Kebijakan Refund",
                  desc: "Tiket yang sudah dibeli tidak dapat dibatalkan, diuangkan kembali, atau dipindahtangankan.",
                },
                {
                  icon: <Medal className="text-amber-600" />,
                  title: "Atribut Lari",
                  desc: "Peserta wajib mengenakan Jersey resmi dan BIB Number yang terlihat jelas selama acara berlangsung.",
                },
                {
                  icon: <Lock className="text-slate-700" />,
                  title: "Keamanan Barang",
                  desc: "Penitipan barang tersedia terbatas. Panitia tidak bertanggung jawab atas kehilangan barang berharga.",
                },
                {
                  icon: <MapPin className="text-red-600" />,
                  title: "Rute & Fasilitas",
                  desc: "Rute lari melewati kawasan bersejarah. Water station tersedia di setiap titik yang telah ditentukan.",
                },
                {
                  icon: <Clock className="text-emerald-600" />,
                  title: "Batas Waktu (Cut-Off)",
                  desc: "Panitia menerapkan batas waktu lari (COT) demi keselamatan dan pembukaan kembali arus lalu lintas.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-red-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-3">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    "{item.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* --- FOOTER MODERN --- */}
          <footer className="bg-slate-900 pt-20 pb-10 relative overflow-hidden">
            {/* Dekorasi Tekstur Halus */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-white/10 pb-12">
                {/* Branding Logo Area */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-2xl font-serif font-black text-white tracking-tighter leading-none mb-2">
                    SURABAYA <span className="text-red-600">HERITAGE</span> RUN
                  </h3>
                  <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">
                    Official Entry Pass 2026
                  </p>
                </div>

                {/* Navigasi Link Cepat */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                  {[
                    { name: "Kebijakan Privasi", to: "/privacy-policy" },
                    { name: "Bantuan Teknis", to: "/contact-support" },
                    { name: "Cek Status", to: "/check-status" },
                  ].map((link, i) => (
                    <Link
                      key={i}
                      to={link.to}
                      className="text-white/50 hover:text-[#D4AF37] text-[11px] font-black uppercase tracking-widest transition-all hover:-translate-y-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Copyright Area */}
              <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                <p className="text-white/20 text-[10px] font-medium tracking-wide">
                  © 2026 Surabaya Heritage Run. All rights reserved.
                  <span className="hidden md:inline mx-2">•</span>
                  Build with Excellence.
                </p>
                <div className="flex items-center gap-4 opacity-20 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <p className="text-white text-[9px] font-bold uppercase tracking-widest">
                    HUT Surabaya ke-733
                  </p>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

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
