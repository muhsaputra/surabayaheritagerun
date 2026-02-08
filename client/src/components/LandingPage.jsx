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

// --- IMPORT GAMBAR DARI ASSETS ---
import heroImage from "../assets/images/GambarUtama.png";
import gallery1 from "../assets/images/gallery1.jpg";
import gallery2 from "../assets/images/gallery2.jpg";
import gallery3 from "../assets/images/gallery3.JPG";
import gallery4 from "../assets/images/gallery4.jpg";
import gallery5 from "../assets/images/gallery5.JPG";
import gallery6 from "../assets/images/gallery6.JPG";
import gallery7 from "../assets/images/gallery7.jpg";
import gallery8 from "../assets/images/gallery8.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  // --- STATE UNTUK TIMELINE & HARGA ---
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [activePrices, setActivePrices] = useState({ "5K": 0, "3K": 0 }); // Default harga 0 dulu

  // --- 1. FETCH DATA DARI BACKEND ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/landing/config`,
        );
        if (res.data.success) {
          setTimelineData(res.data.data);

          // Set Harga Aktif jika ada
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

  // Helper Format Rupiah
  const formatPrice = (price) => {
    if (!price) return "-";
    return price / 1000 + "k"; // Ubah 150000 jadi 150k
  };

  // Helper Icon Timeline
  const getTimelineIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("presale")) return <Flame size={28} />;
    if (n.includes("early")) return <Sprout size={28} />;
    return <CalendarRange size={28} />;
  };

  // Data Foto Galeri
  const galleryImages = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery5,
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
            fetchPriority="high" // Prioritas tinggi
            loading="eager" // Muat segera
            decoding="sync"
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
          <div className="text-center py-12 text-slate-400">
            Memuat Jadwal...
          </div>
        ) : !timelineData ? (
          <div className="text-center py-12 text-red-400">
            Gagal memuat jadwal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelineData.phases.map((phase, index) => {
              const isActive = index === timelineData.activePhaseIndex;
              const isPassed = index < timelineData.activePhaseIndex;
              const isUpcoming = index > timelineData.activePhaseIndex;

              const limit5K = phase.limits["5K"] || 0;
              const limit3K = phase.limits["3K"] || 0;
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
                  className={`
                    relative p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between min-h-[280px]
                    ${
                      isActive
                        ? "bg-slate-900 text-white shadow-2xl scale-[1.02] border-slate-900 z-10 ring-4 ring-slate-100"
                        : isPassed
                          ? "bg-slate-50 text-slate-400 border-slate-200 grayscale opacity-80"
                          : "bg-white text-slate-900 border-slate-200 hover:border-red-200 hover:shadow-lg"
                    }
                  `}
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
                      {isPassed && (
                        <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={12} /> Selesai
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Lock size={12} /> Segera
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-2xl mb-1">{phase.name}</h3>
                    <p
                      className={`font-bold text-sm mb-6 ${isActive ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {new Date(phase.start).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
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
                      <p className="text-[10px] text-slate-400 mt-2 text-right italic">
                        {isSoldOut
                          ? "Mohon tunggu fase berikutnya."
                          : "Segera daftar sebelum kehabisan!"}
                      </p>
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

      {/* --- KATEGORI LARI (UPDATED: PHOTO BACKGROUND) --- */}
      <div className="relative py-24 overflow-hidden">
        {/* 1. BACKGROUND IMAGE (Ganti src dengan gambar yang diinginkan) */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage} // Bisa diganti dengan gallery5 atau gambar lain
            alt="Background Kategori"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* 2. DARK OVERLAY (Membuat foto jadi gelap agar teks terbaca) */}
        {/* Opacity 85% (bg-slate-900/85) membuat gambar terlihat samar di belakang */}
        <div className="absolute inset-0 z-0 bg-slate-900/85 mix-blend-multiply"></div>

        {/* 3. GRADIENT ACCENT (Opsional: Agar transisi atas/bawah halus) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/80"></div>

        {/* --- KONTEN UTAMA (Relative z-10 agar di atas background) --- */}
        <div className="text-center px-4 max-w-4xl mx-auto mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 drop-shadow-lg">
            Pilih Kategori Lari
          </h2>
          <p className="text-gray-300 text-lg drop-shadow-md">
            Satu fasilitas untuk semua. Tanpa perbedaan, tanpa pengecualian.{" "}
            <br />
            <span className="text-red-500 font-bold">
              Semua finisher adalah juara.
            </span>
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {/* 5K CARD */}
            <div className="bg-white p-2 rounded-[2.5rem] flex-1 shadow-2xl hover:scale-105 transition-transform duration-300">
              <div className="bg-slate-50 p-8 rounded-[2rem] h-full flex flex-col border border-slate-100">
                <div className="mb-6">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-6xl font-black text-slate-900 mb-2">5K</h3>
                <p className="text-slate-500 font-bold tracking-widest uppercase mb-8">
                  Heritage Run
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Jersey Heritage Exclusive",
                    "All Finisher Medal",
                    "BIB Number (Non-Chip)",
                    "String Bag",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-slate-700"
                    >
                      <CheckCircle
                        size={18}
                        className="text-red-600 flex-shrink-0"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-200 pt-6">
                  <p className="text-slate-400 text-xs mb-1">
                    Biaya Pendaftaran
                  </p>
                  <div className="flex items-end gap-2 mb-6">
                    {/* 👇 HARGA DINAMIS */}
                    <span className="text-4xl font-black text-slate-900">
                      {formatPrice(activePrices["5K"])}
                    </span>
                    <span className="text-sm text-slate-500 mb-2">/ pax</span>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all flex justify-center items-center gap-2"
                  >
                    Daftar 5K <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* 3K CARD */}
            <div className="bg-white p-2 rounded-[2.5rem] flex-1 shadow-xl hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-8 rounded-[2rem] h-full flex flex-col">
                <div className="mb-6">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Family Friendly
                  </span>
                </div>
                <h3 className="text-6xl font-black text-slate-900 mb-2">3K</h3>
                <p className="text-slate-500 font-bold tracking-widest uppercase mb-8">
                  Fun Walk
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Jersey Heritage Exclusive",
                    "All Finisher Medal",
                    "BIB Number (Non-Chip)",
                    "String Bag",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-slate-600"
                    >
                      <CheckCircle
                        size={18}
                        className="text-slate-400 flex-shrink-0"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-slate-400 text-xs mb-1">
                    Biaya Pendaftaran
                  </p>
                  <div className="flex items-end gap-2 mb-6">
                    {/* 👇 HARGA DINAMIS */}
                    <span className="text-4xl font-black text-slate-900">
                      {formatPrice(activePrices["3K"])}
                    </span>
                    <span className="text-sm text-slate-500 mb-2">/ pax</span>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-900 hover:text-white transition-all flex justify-center items-center gap-2"
                  >
                    Daftar 3K <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center bg-white/5 rounded-xl p-4 border border-white/10 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="text-gray-300 text-sm flex items-center justify-center gap-2">
              <Info size={16} className="text-red-500" />
              <span className="opacity-80">
                Catatan: Fasilitas Race Pack SAMA untuk kategori 5K maupun 3K.
                Tidak ada sistem COT (Cut Off Time).
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* --- GALLERY --- */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Jejak <span className="text-red-600">Langkah</span>
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto"></div>
            <p className="text-slate-500 mt-6 max-w-xl mx-auto">
              Galeri kemeriahan event tahun lalu. Tahun ini giliranmu membuat
              sejarah.
            </p>
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
                  loading="lazy" // Lazy load gambar galeri
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- IMPORTANT INFO --- */}
      <div className="max-w-6xl mx-auto px-4 my-24">
        <div className="bg-slate-50 rounded-[3rem] p-10 md:p-16 border border-slate-200">
          <h2 className="text-3xl font-serif font-bold text-center text-slate-900 mb-12 flex items-center justify-center gap-3">
            <FileText className="text-red-600" /> Informasi Penting
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <CheckCircle />,
                title: "Non-Timing Chip",
                desc: "Event ini bersifat Fun Run. BIB tidak dilengkapi chip waktu.",
              },
              {
                icon: <Trophy />,
                title: "No Cut Off Time",
                desc: "Semua finisher berhak mendapatkan medali.",
              },
              {
                icon: <Ban />,
                title: "Non-Refundable",
                desc: "Tiket tidak dapat dikembalikan tanpa alasan force majeure.",
              },
              {
                icon: <UserCheck />,
                title: "Race Pack Collection",
                desc: "Wajib membawa KTP & Bukti Email saat pengambilan.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
              >
                <div className="text-slate-400 group-hover:text-red-600 transition-colors mt-1">
                  {React.cloneElement(item.icon, { size: 32 })}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
