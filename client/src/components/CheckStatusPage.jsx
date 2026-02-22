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
  User,
  Zap,
  Ticket,
  Star,
  Verified,
  Fingerprint,
  Crown,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

/**
 * SURABAYA HERITAGE RUN 2026 - OFFICIAL RACE CHECKER
 * Engineered for Typography Consistency and A4 PDF Precision
 */
const CheckStatusPage = () => {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [isTicketLoaded, setIsTicketLoaded] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // --- NAVIGATION & CONTEXT ---
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const ticketRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  /**
   * Fire Premium Celebration Confetti
   */
  const fireConfetti = () => {
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });

    confetti({
      shapes: [triangle],
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#7B1818", "#D4AF37", "#0F172A"],
      zIndex: 9999,
    });
  };

  /**
   * Search Participant Handler
   */
  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Sila masukkan alamat e-mail pendaftaran anda.");
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

        // Generate high-definition black QR Code for perfect scanning
        const qrUrl = await QRCode.toDataURL(data._id, {
          width: 1000,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);

        if (data.paymentStatus === "paid") fireConfetti();
        setTimeout(() => setIsTicketLoaded(true), 400);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "E-mail tidak ditemui. Sila cuba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * High-Resolution A4 PDF Exporter
   */
  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      // Ensure all elements are painted
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 4, // Ultra-HD for printing
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 850, // Fixed width for A4 proportion logic
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
      pdf.save(`SHR2026_Ticket_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("Gagal menjana PDF. Sila ambil tangkapan skrin sebagai ganti.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden selection:bg-[#7B1818] selection:text-white">
      {/* ------------------- TOP DECORATIVE HEADER ------------------- */}
      <div className="relative h-[25vh] md:h-[35vh] bg-[#7B1818] rounded-b-[4rem] md:rounded-b-[6rem] overflow-hidden shadow-[0_20px_50px_rgba(123,24,24,0.3)] transition-all duration-1000">
        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#7B1818]/40"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 text-center flex flex-col items-center animate-fade-in-up">
          <button
            onClick={() => navigate("/")}
            className="mb-8 bg-white/10 hover:bg-white/25 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Kembali
          </button>

          <div className="flex flex-col items-center gap-3 mb-2">
            <Ticket className="text-[#D4AF37]" size={32} />
            <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Race <span className="text-[#D4AF37]">Checker</span>
            </h1>
          </div>
          <p className="text-white/60 text-xs md:text-sm font-medium tracking-widest uppercase opacity-80">
            Heritage Pass Verification Engine
          </p>
        </div>
      </div>

      {/* ------------------- SEARCH CONSOLE ------------------- */}
      <div className="max-w-xl mx-auto px-4 md:px-6 -mt-10 md:-mt-14 relative z-20 pb-20">
        <div className="bg-white/95 backdrop-blur-2xl p-2 md:p-3 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.12)] mb-12 flex flex-col md:flex-row gap-2 border border-white/60 group transition-all hover:shadow-[0_30px_60px_rgba(123,24,24,0.15)]">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-hover:text-[#7B1818]"
              size={18}
            />
            <input
              type="email"
              placeholder="Masukkan e-mail pendaftaran..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck(e)}
              className="w-full pl-14 pr-5 py-4 rounded-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-[#0F172A] placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-10 py-4 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 overflow-hidden relative group/btn"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Zap size={16} className="fill-current" />
              )}
              {loading ? "Mencari..." : "Semak"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-50/80 backdrop-blur-md border border-red-100 rounded-3xl text-red-600 flex items-center gap-4 animate-fade-in-up">
            <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg shadow-red-500/20">
              <AlertCircle size={20} />
            </div>
            <p className="font-bold text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* ------------------- PREMIUM TICKET UI ------------------- */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* TICKET CONTAINER (Captured as PDF) */}
            <div className="p-1 md:p-3 bg-transparent">
              <div
                ref={ticketRef}
                className="bg-white rounded-[3rem] md:rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden mb-10 border border-slate-100 relative group/ticket"
                style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
              >
                {/* BRANDED HEADER */}
                <div className="bg-[#7B1818] pt-14 pb-10 px-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-5 bg-white/10 p-3.5 rounded-2xl backdrop-blur-lg border border-white/20 shadow-inner">
                      <Trophy className="text-[#D4AF37]" size={40} />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.3em] mb-2 leading-none drop-shadow-md">
                      SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                      RUN
                    </h2>
                    <div className="flex items-center gap-5 w-full justify-center opacity-80">
                      <div className="h-[1px] w-12 bg-gradient-to-l from-[#D4AF37] to-transparent"></div>
                      <p className="text-[#D4AF37] text-[10px] md:text-[11px] font-black tracking-[0.5em] uppercase whitespace-nowrap">
                        Official Entry Pass • 2026
                      </p>
                      <div className="h-[1px] w-12 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* TICKET MAIN BODY */}
                <div className="px-10 md:px-16 py-12 md:py-14 bg-white relative">
                  {/* Runner Info & Category Badge */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-14 border-b border-slate-100 pb-12 relative">
                    <div className="space-y-5 w-full md:w-auto">
                      <div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-3">
                          Runner Identity
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black text-[#0F172A] uppercase leading-tight tracking-tight font-serif italic">
                          {result.fullName}
                        </h3>
                      </div>

                      <div className="flex items-center flex-wrap gap-4">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm font-black text-[10px] uppercase tracking-wider ${
                            result.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {result.paymentStatus === "paid" ? (
                            <ShieldCheck size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {result.paymentStatus === "paid"
                            ? "Bayaran Disahkan"
                            : "Menunggu Bayaran"}
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase bg-slate-50 px-4 py-2 rounded-full border border-slate-100 tracking-widest">
                          <Fingerprint size={14} className="opacity-40" />{" "}
                          {result._id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Category Box */}
                    <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-5 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-[#7B1818]/10 min-w-[130px] w-full md:w-auto justify-center gap-5 md:gap-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-transform hover:rotate-1">
                      <span className="text-[9px] font-black text-[#7B1818] uppercase tracking-[0.2em] opacity-60">
                        Category
                      </span>
                      <span className="text-4xl md:text-7xl font-black text-[#0F172A] leading-none font-sans">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* Core Race Data Grid */}
                  <div className="grid grid-cols-2 gap-6 md:gap-10 mb-14">
                    {/* BIB Block */}
                    <div className="group bg-[#7B1818] p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-[#7B1818]/20 transition-all duration-500 hover:-translate-y-1">
                      <Hash
                        className="absolute -right-5 -bottom-5 opacity-10 rotate-12 transition-transform duration-1000 group-hover:scale-150"
                        size={140}
                      />
                      <span className="text-[9px] md:text-[11px] font-black uppercase opacity-60 tracking-[0.4em] mb-3 block">
                        BIB Number
                      </span>
                      <p className="text-4xl md:text-7xl font-black font-serif leading-none tracking-tighter">
                        #{result.bibNumber || "---"}
                      </p>
                    </div>

                    {/* Jersey Block */}
                    <div className="group bg-[#0F172A] p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 transition-all duration-500 hover:-translate-y-1">
                      <Shirt
                        className="absolute -right-5 -bottom-5 opacity-10 rotate-12 transition-transform duration-1000 group-hover:scale-150"
                        size={140}
                      />
                      <span className="text-[9px] md:text-[11px] font-black uppercase opacity-60 tracking-[0.4em] mb-3 block">
                        Jersey Size
                      </span>
                      <p className="text-4xl md:text-7xl font-black leading-none tracking-tighter uppercase">
                        {result.jerseySize}
                      </p>
                    </div>
                  </div>

                  {/* Logistic Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-14 md:mb-20">
                    <div className="flex items-center gap-6 p-6 md:p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)]">
                      <div className="bg-white w-14 h-14 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-slate-50 transition-all group-hover:bg-[#7B1818] group-hover:text-white group-hover:rotate-6">
                        <MapPin size={26} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                          Venue
                        </p>
                        <p className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight">
                          Plaza Internatio, Surabaya
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 md:p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)]">
                      <div className="bg-white w-14 h-14 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-slate-50 transition-all group-hover:bg-[#7B1818] group-hover:text-white group-hover:-rotate-6">
                        <Calendar size={26} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                          Flag-Off Time
                        </p>
                        <p className="text-sm md:text-base font-black text-slate-800 font-serif tracking-tight uppercase">
                          24 Mei 2026 • 06:00 WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SCAN ZONE CALIBRATION */}
                  <div className="flex flex-col items-center pt-12 border-t-2 border-dashed border-slate-100 relative">
                    {/* Decorative Scanner Lines */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full opacity-[0.03] pointer-events-none bg-gradient-to-b from-[#7B1818] to-transparent"></div>

                    <div className="relative group/qr">
                      <div className="absolute -inset-6 bg-[#D4AF37]/15 rounded-[4rem] blur-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-700"></div>
                      <div className="bg-white p-6 md:p-8 rounded-[3rem] md:rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-50 mb-8 relative transition-all duration-700 group-hover/qr:scale-[1.03] group-hover/qr:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Official Verification QR"
                            className="w-[180px] md:w-[240px] h-[180px] md:h-[240px] block rounded-2xl"
                          />
                        ) : (
                          <div className="w-[180px] md:w-[240px] h-[180px] md:h-[240px] flex items-center justify-center bg-slate-50 rounded-3xl animate-pulse">
                            <Loader2
                              className="animate-spin text-slate-200"
                              size={32}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] md:text-[12px] text-slate-400 font-black uppercase tracking-[0.7em] mb-6 text-center leading-relaxed">
                      Sila Imbas Semasa Pengambilan Race Pack
                    </p>

                    <div className="flex items-center gap-3 bg-slate-50 px-10 py-3.5 rounded-full border border-slate-100 shadow-inner group/verified transition-all hover:bg-emerald-50 hover:border-emerald-100">
                      <Verified
                        size={18}
                        className="text-emerald-500 transition-transform group-hover/verified:scale-110"
                      />
                      <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] group-hover/verified:text-emerald-600">
                        Official Verified Runner Pass
                      </span>
                    </div>
                  </div>
                </div>

                {/* PREMIUM TICKET FOOTER */}
                <div className="bg-[#0F172A] py-12 md:py-16 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>

                  {/* Floating Center Seal */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-[#FDFBF7] shadow-xl">
                    <Star className="text-[#D4AF37]" size={20} fill="#D4AF37" />
                  </div>

                  <div className="relative z-10 space-y-3">
                    <p className="text-white text-[10px] md:text-[12px] font-black tracking-[0.8em] uppercase opacity-50">
                      WWW.SURABAYAHERITAGERUN.COM
                    </p>
                    <p className="text-white/20 text-[8px] md:text-[9px] uppercase tracking-[0.3em] px-12 max-w-2xl mx-auto leading-relaxed font-light">
                      Sila bawa dokumen pengenalan diri asal untuk proses
                      pengesahan di kaunter urus setia pada hari acara.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION SECTION (Outside PDF Snapshot Area) */}
            <div className="space-y-6 mt-8 animate-fade-in-up">
              {result.paymentStatus === "paid" ? (
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="w-full bg-[#0F172A] hover:bg-black text-white py-8 md:py-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_rgba(15,23,42,0.3)] flex items-center justify-center gap-5 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-70 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {downloading ? (
                    <Loader2
                      className="animate-spin text-[#D4AF37]"
                      size={28}
                    />
                  ) : (
                    <div className="relative">
                      <Download
                        className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                        size={28}
                      />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F172A]"></div>
                    </div>
                  )}

                  <div className="flex flex-col items-start">
                    <span className="font-black tracking-[0.3em] uppercase text-xs md:text-lg leading-none mb-1">
                      {downloading ? "Sila Tunggu..." : "Muat Turun E-Tiket"}
                    </span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      Standard A4 Format Ready
                    </span>
                  </div>
                </button>
              ) : (
                <div className="p-10 md:p-14 bg-white/60 backdrop-blur-md border border-white/80 rounded-[4rem] text-center shadow-2xl">
                  <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-amber-600 border border-amber-200 rotate-3 shadow-lg">
                    <Clock size={40} className="animate-pulse" />
                  </div>
                  <h4 className="text-[#0F172A] font-black uppercase text-lg tracking-[0.2em] mb-3">
                    Status: Pending Payment
                  </h4>
                  <p className="text-slate-500 text-sm mb-10 max-w-[300px] mx-auto leading-relaxed font-medium">
                    Sila selesaikan bayaran untuk mengaktifkan BIB pendaftaran
                    dan memuat turun e-tiket rasmi anda.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/payment", { state: { userData: result } })
                    }
                    className="bg-[#7B1818] text-white px-16 py-6 rounded-full font-black text-sm shadow-[0_20px_40px_rgba(123,24,24,0.3)] active:scale-95 hover:bg-black transition-all uppercase tracking-[0.3em] flex items-center gap-3 mx-auto"
                  >
                    Bayar Sekarang <Zap size={18} fill="white" />
                  </button>
                </div>
              )}

              {/* Verified Footer */}
              <div className="flex justify-center items-center gap-8 py-10 opacity-30 group">
                <div className="flex flex-col items-center">
                  <Fingerprint size={24} />
                  <span className="text-[8px] font-black uppercase mt-2">
                    Biometric ID
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <Award size={24} />
                  <span className="text-[8px] font-black uppercase mt-2">
                    PASI Certified
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-slate-300"></div>
                <div className="flex flex-col items-center">
                  <Crown size={24} />
                  <span className="text-[8px] font-black uppercase mt-2">
                    Heritage Elite
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL KEYFRAME ANIMATIONS */}
      <style>{`
         .animate-fade-in-up { 
           animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
         }
         @keyframes fadeInUp { 
           from { opacity: 0; transform: translateY(40px); } 
           to { opacity: 1; transform: translateY(0); } 
         }
         
         /* Advanced Scrollbar Aesthetics */
         ::-webkit-scrollbar { width: 6px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 10px; }
         
         /* Image Anti-Aliasing Fix */
         img { 
           image-rendering: -webkit-optimize-contrast; 
           backface-visibility: hidden;
         }
         
         /* Text Sharpness Optimization */
         body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
