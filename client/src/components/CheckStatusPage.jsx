import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  Search,
  ArrowLeft,
  Download,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Hash,
  Shirt,
  Trophy,
  History,
  ShieldCheck,
  Check,
  Zap,
  Ticket,
  Star,
  Verified,
  Fingerprint,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const CheckStatusPage = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [isTicketLoaded, setIsTicketLoaded] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const ticketRef = useRef(null);

  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7B1818", "#D4AF37", "#0F172A"],
    });
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Masukkan email pendaftaran Anda.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setIsTicketLoaded(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await axios.post(`${apiUrl}/api/check-status`, { email });

      if (res.data.success) {
        const data = res.data.data;
        setResult(data);

        // FIX: Generate QR sebagai Base64 murni agar terbaca di PDF Mobile
        const qrUrl = await QRCode.toDataURL(data._id, {
          width: 800,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);

        if (data.paymentStatus === "paid") fireConfetti();
        setTimeout(() => setIsTicketLoaded(true), 400);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Data tidak ditemukan. Pastikan email Anda benar.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      // Jeda krusial agar sinkronisasi render gambar di peramban selesai
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Skala 3 cukup tajam namun ringan untuk HP
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      pdf.save(`Tiket_SHR2026_${result.fullName.split(" ")[0]}.pdf`);
    } catch (err) {
      alert("Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden selection:bg-[#7B1818] selection:text-white">
      {/* ------------------- HEADER ------------------- */}
      <div className="relative h-[25vh] md:h-[30vh] bg-[#7B1818] rounded-b-[3rem] overflow-hidden shadow-2xl transition-all duration-1000">
        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Beranda
          </button>
          <div className="flex flex-col items-center gap-2 mb-1">
            <Ticket className="text-[#D4AF37]" size={28} />
            <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Status <span className="text-[#D4AF37]">Peserta</span>
            </h1>
          </div>
        </div>
      </div>

      {/* ------------------- SEARCH FORM ------------------- */}
      <div className="max-w-xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20 pb-20">
        <div className="bg-white/95 backdrop-blur-2xl p-2 rounded-full shadow-2xl mb-12 flex flex-col md:flex-row gap-2 border border-white/50">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type="email"
              placeholder="Masukkan email pendaftaran..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-5 py-4 rounded-full bg-transparent border-none focus:ring-0 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-10 py-4 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.15em] shadow-lg active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} className="fill-current" />
            )}{" "}
            Cek
          </button>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-4 animate-fade-in-up">
            <AlertCircle size={20} />{" "}
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* ------------------- TICKET AREA (A4 PROPORTION) ------------------- */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <div
              ref={ticketRef}
              className="bg-white p-4 md:p-8 overflow-hidden"
            >
              <div className="bg-white rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-[#7B1818] pt-10 pb-8 px-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <Trophy className="text-[#D4AF37] mb-3" size={32} />
                    <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.25em] mb-1">
                      SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                      RUN
                    </h2>
                    <p className="text-[#D4AF37] text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase">
                      Pas Masuk Resmi • 2026
                    </p>
                  </div>
                </div>

                <div className="px-8 md:px-14 py-10 bg-white">
                  {/* Identity Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 border-b border-slate-50 pb-8">
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] block">
                        {" "}
                        Runner Identity
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase leading-tight font-serif italic tracking-tight">
                        {result.fullName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <ShieldCheck size={12} /> Verified
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-[#FDFBF7] p-4 rounded-[1.5rem] border-2 border-[#7B1818]/10 min-w-[100px] shadow-sm">
                      <span className="text-[8px] font-black text-[#7B1818] uppercase tracking-widest opacity-60 mb-1">
                        Kategori
                      </span>
                      <span className="text-2xl md:text-4xl font-black text-slate-900 leading-none">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* BIB & Jersey (REDUCED SIZE) */}
                  <div className="grid grid-cols-2 gap-5 mb-10">
                    <div className="bg-[#7B1818] p-5 md:p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-[#7B1818]/20">
                      <Hash
                        className="absolute -right-3 -bottom-3 opacity-10 rotate-12"
                        size={80}
                      />
                      <span className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                        Nomor BIB
                      </span>
                      <p className="text-3xl md:text-4xl font-black font-serif tracking-tighter">
                        #{result.bibNumber || "PENDING"}
                      </p>
                    </div>
                    <div className="bg-[#0F172A] p-5 md:p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-[#0F172A]/20">
                      <Shirt
                        className="absolute -right-3 -bottom-3 opacity-10 rotate-12"
                        size={80}
                      />
                      <span className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                        Ukuran Jersey
                      </span>
                      <p className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                        {result.jerseySize}
                      </p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <MapPin size={20} className="text-[#7B1818]" />
                      <div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Race Venue
                        </p>
                        <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase">
                          Plaza Internatio, SBY
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <Calendar size={20} className="text-[#7B1818]" />
                      <div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Start Time
                        </p>
                        <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase">
                          24 Mei 2026 | 06:00 WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR ZONE (LARGE & CENTERED IN PDF) */}
                  <div className="flex flex-col items-center pt-8 border-t-2 border-dashed border-slate-100 relative">
                    <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 mb-6 group hover:scale-[1.02] transition-transform">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR Verifikasi"
                          className="w-[180px] md:w-[220px] h-[180px] md:h-[220px] block rounded-xl"
                        />
                      ) : (
                        <div className="w-[180px] h-[180px] flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse">
                          <Loader2
                            className="animate-spin text-slate-200"
                            size={32}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-4 text-center">
                      Tunjukkan saat Pengambilan Race Pack
                    </p>
                    <div className="flex items-center gap-2 bg-slate-50 px-6 py-2 rounded-full border border-slate-100 shadow-inner">
                      <Verified size={16} className="text-emerald-500" />
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none">
                        Official Verified Pass
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#0F172A] py-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Star className="text-[#D4AF37]" size={14} fill="#D4AF37" />
                  </div>
                  <p className="text-white text-[8px] font-black tracking-[0.6em] uppercase opacity-40">
                    www.surabayaheritagerun.com
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON (PDF A4) */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-6 md:py-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={22} />
                ) : (
                  <Download
                    className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                    size={22}
                  />
                )}
                <span className="font-black tracking-[0.2em] uppercase text-xs md:text-sm">
                  {downloading ? "Menjana PDF..." : "Unduh E-Tiket (PDF A4)"}
                </span>
              </button>
            ) : (
              <div className="p-10 bg-white border border-slate-100 rounded-[3rem] text-center shadow-xl">
                <Clock
                  size={40}
                  className="mx-auto text-amber-500 mb-4 animate-pulse"
                />
                <h4 className="text-slate-900 font-black uppercase text-sm tracking-widest mb-2">
                  Pembayaran Tertunda
                </h4>
                <button
                  onClick={() =>
                    navigate("/payment", { state: { userData: result } })
                  }
                  className="bg-[#7B1818] text-white px-10 py-4 rounded-full font-black text-xs shadow-lg active:scale-95 hover:bg-black transition-all uppercase tracking-widest"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
         ::-webkit-scrollbar { width: 5px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 10px; }
         img { image-rendering: -webkit-optimize-contrast; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
