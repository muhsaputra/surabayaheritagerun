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
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7B1818", "#D4AF37", "#0F172A"],
    });
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Silakan masukkan email pendaftaran Anda.");
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
        setResult(res.data.data);
        const qrUrl = await QRCode.toDataURL(res.data.data._id, {
          width: 800,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);
        if (res.data.data.paymentStatus === "paid") fireConfetti();
        setTimeout(() => setIsTicketLoaded(true), 300);
      }
    } catch (err) {
      setError("Email tidak ditemukan. Pastikan alamat sudah benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 800, // Menjamin proporsi A4 tetap rapi saat capture dari mobile
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      pdf.save(`SHR2026_Tiket_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      alert("Gagal mengunduh tiket.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden selection:bg-[#7B1818] selection:text-white">
      {/* ------------------- HEADER Section ------------------- */}
      <div className="relative h-[25vh] md:h-[30vh] bg-[#7B1818] rounded-b-[3rem] overflow-hidden shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B1818] to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Beranda
          </button>
          <div className="flex flex-col items-center gap-1 mb-1">
            <Ticket className="text-[#D4AF37]" size={24} />
            <h1 className="text-xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Status <span className="text-[#D4AF37]">Peserta</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8 md:-mt-12 relative z-20 pb-20">
        {/* ------------------- SEARCH BAR ------------------- */}
        <div className="bg-white/95 backdrop-blur-2xl p-1.5 md:p-2 rounded-[2rem] md:rounded-full shadow-2xl mb-8 flex flex-col md:flex-row gap-2 border border-white/50 group transition-all">
          <div className="relative flex-1">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type="email"
              placeholder="Email anda..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-transparent border-none focus:ring-0 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-8 py-3.5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} className="fill-current" />
            )}{" "}
            Cek Status
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-fade-in-up">
            <AlertCircle size={18} className="shrink-0" />{" "}
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* ------------------- TICKET AREA (Snapshot Ref) ------------------- */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div
              ref={ticketRef}
              className="bg-white p-2 sm:p-4 md:p-8 overflow-hidden rounded-[2.5rem] md:rounded-[4rem]"
            >
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100">
                {/* PDF BRANDING HEADER */}
                <div className="bg-[#7B1818] pt-8 md:pt-10 pb-6 md:pb-8 px-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <Trophy className="text-[#D4AF37] mb-2" size={24} md={32} />
                    <h2 className="text-lg md:text-3xl font-black text-white uppercase tracking-[0.1em] md:tracking-[0.25em] mb-1">
                      SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                      RUN
                    </h2>
                    <p className="text-[#D4AF37] text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase">
                      Pas Masuk Resmi • 2026
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-8 md:px-14 py-8 md:py-10 bg-white">
                  {/* Runner Info Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 md:mb-10 border-b border-slate-50 pb-6 md:pb-8">
                    <div className="space-y-2 w-full md:w-auto">
                      <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block">
                        Runner Identity
                      </span>
                      <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase leading-tight font-serif italic tracking-tight break-words">
                        {result.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[8px] md:text-[9px] uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                        <ShieldCheck size={12} /> Verified
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border-2 border-[#7B1818]/10 min-w-[90px] w-full md:w-auto justify-center gap-3 md:gap-1 shadow-sm">
                      <span className="text-[7px] md:text-[8px] font-black text-[#7B1818] uppercase tracking-widest opacity-60">
                        Category
                      </span>
                      <span className="text-xl md:text-4xl font-black text-slate-900 leading-none">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* Core Stats (BIB & Jersey) - Mobile Responsive Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-5 mb-10">
                    <div className="bg-[#7B1818] p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-white relative overflow-hidden shadow-lg">
                      <Hash
                        className="absolute -right-2 -bottom-2 opacity-10 rotate-12"
                        size={60}
                      />
                      <span className="text-[7px] md:text-[8px] font-black uppercase opacity-60 tracking-[0.1em] mb-1 block">
                        Nomor BIB
                      </span>
                      <p className="text-2xl md:text-4xl font-black font-serif leading-none tracking-tighter">
                        #{result.bibNumber || "---"}
                      </p>
                    </div>
                    <div className="bg-[#0F172A] p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-white relative overflow-hidden shadow-lg">
                      <Shirt
                        className="absolute -right-2 -bottom-2 opacity-10 rotate-12"
                        size={60}
                      />
                      <span className="text-[7px] md:text-[8px] font-black uppercase opacity-60 tracking-[0.1em] mb-1 block text-slate-400">
                        Ukuran Jersey
                      </span>
                      <p className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter">
                        {result.jerseySize}
                      </p>
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 md:mb-14">
                    <div className="flex items-center gap-3 md:gap-4 p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-[1.5rem] border border-slate-100">
                      <MapPin size={16} className="text-[#7B1818] shrink-0" />
                      <div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Venue
                        </p>
                        <p className="text-[9px] md:text-xs font-black text-slate-800 uppercase leading-none mt-0.5">
                          Plaza Internatio, Surabaya
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-[1.5rem] border border-slate-100">
                      <Calendar size={16} className="text-[#7B1818] shrink-0" />
                      <div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Waktu Mulai
                        </p>
                        <p className="text-[9px] md:text-xs font-black text-slate-800 uppercase leading-none mt-0.5 font-serif">
                          24 Mei | 06:00 WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR SECTION */}
                  <div className="flex flex-col items-center pt-8 border-t-2 border-dashed border-slate-100">
                    <div className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-50 mb-4 transition-transform active:scale-95">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Official QR"
                          className="w-[120px] md:w-[200px] h-[120px] md:h-[200px] block rounded-lg"
                        />
                      ) : (
                        <div className="w-[120px] h-[120px] flex items-center justify-center bg-slate-50 rounded-xl">
                          <Loader2 className="animate-spin text-slate-200" />
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4 text-center px-4">
                      Pindai QR saat Pengambilan Race Pack
                    </p>
                  </div>
                </div>

                {/* Aesthetic Footer Tiket */}
                <div className="bg-[#0F172A] py-6 md:py-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                    <Star
                      className="text-[#D4AF37]"
                      size={10}
                      md={14}
                      fill="#D4AF37"
                    />
                  </div>
                  <p className="text-white text-[7px] md:text-[8px] font-black tracking-[0.5em] uppercase opacity-40">
                    www.surabayaheritagerun.com
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------- ACTION BUTTON ------------------- */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] shadow-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 group relative overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                ) : (
                  <Download
                    className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                    size={20}
                  />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="font-black tracking-[0.1em] md:tracking-[0.2em] uppercase text-[10px] md:text-sm leading-none mb-1">
                    {downloading ? "Sila Tunggu..." : "Download E-Tiket"}
                  </span>
                  <span className="text-[8px] md:text-[9px] text-white/30 uppercase font-bold">
                    Kualitas HD • Ukuran Auto
                  </span>
                </div>
              </button>
            ) : (
              <div className="p-8 bg-white border border-slate-100 rounded-[2rem] text-center shadow-xl mt-6">
                <Clock
                  size={32}
                  className="mx-auto text-amber-500 mb-4 animate-pulse"
                />
                <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-3">
                  Status: Pembayaran Tertunda
                </h4>
                <button
                  onClick={() =>
                    navigate("/payment", { state: { userData: result } })
                  }
                  className="bg-[#7B1818] text-white px-10 py-3.5 rounded-full font-black text-[10px] shadow-lg active:scale-95 hover:bg-black transition-all uppercase tracking-widest"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
         ::-webkit-scrollbar { width: 4px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 10px; }
         img { image-rendering: -webkit-optimize-contrast; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
