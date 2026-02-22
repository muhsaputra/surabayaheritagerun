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
  Award,
  Fingerprint,
  Verified,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

/**
 * CheckStatusPage - Premium Edition
 * Optimized for A4 PDF Output and Professional UI/UX
 */
const CheckStatusPage = () => {
  // State Management
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [isTicketLoaded, setIsTicketLoaded] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Navigation & Params
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ref for PDF Capture
  const ticketRef = useRef(null);

  // Auto-fill email from navigation state or URL params
  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  /**
   * Confetti Celebration for Paid Users
   */
  const fireConfetti = () => {
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });

    confetti({
      shapes: [triangle],
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#7B1818", "#D4AF37", "#0F172A"],
      zIndex: 9999,
    });
  };

  /**
   * API Handler - Fetch Participant Status
   */
  const handleCheck = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Sila masukkan alamat email pendaftaran anda.");
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
        const participantData = res.data.data;
        setResult(participantData);

        // Generate High-Contrast Black QR Code for reliable scanning
        const qrUrl = await QRCode.toDataURL(participantData._id, {
          width: 800,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(qrUrl);

        // Success Feedback
        if (participantData.paymentStatus === "paid") {
          fireConfetti();
        }

        setTimeout(() => setIsTicketLoaded(true), 300);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Email tidak ditemukan. Pastikan e-mail anda betul.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * PDF Generator - Optimized for A4 Printing
   */
  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;

    setDownloading(true);

    try {
      // Sync Delay to ensure all assets (QR/Icons) are fully painted
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 4, // Ultra-HD Quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 800, // Fixed width for consistent capture
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image with small vertical offset for center-heavy look
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

      const fileName = `E-Ticket_SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF Engine Error:", err);
      alert(
        "Sistem gagal menjana PDF. Sila cuba lagi atau ambil tangkapan skrin.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden selection:bg-[#7B1818] selection:text-white">
      {/* ------------------- HEADER ------------------- */}
      <div className="relative h-[25vh] md:h-[35vh] bg-[#7B1818] rounded-b-[4rem] overflow-hidden shadow-2xl transition-all duration-700">
        {/* Pinstripe Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B1818] via-transparent to-black/30"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Beranda
          </button>

          <div className="flex flex-col items-center gap-2 mb-2">
            <Ticket className="text-[#D4AF37] animate-pulse" size={28} />
            <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              RACE <span className="text-[#D4AF37]">PASS</span>
            </h1>
          </div>
          <p className="text-white/60 text-xs md:text-sm font-medium tracking-wide">
            Semak status penyertaan dan muat turun e-tiket rasmi anda
          </p>
        </div>
      </div>

      {/* ------------------- SEARCH FORM ------------------- */}
      <div className="max-w-xl mx-auto px-4 md:px-6 -mt-10 md:-mt-14 relative z-20 pb-20">
        <div className="bg-white/95 backdrop-blur-xl p-2 md:p-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-12 flex flex-col md:flex-row gap-2 border border-white/50">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type="email"
              placeholder="Masukkan e-mail anda..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCheck(e)}
              className="w-full pl-14 pr-5 py-4 rounded-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-10 py-4 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} className="fill-current" />
            )}
            {loading ? "Mencari..." : "Semak"}
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-4 animate-fade-in-up">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle size={20} />
            </div>
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* ------------------- TICKET DISPLAY ------------------- */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* WRAPPER FOR PDF ALIGNMENT (Prevents clipping) */}
            <div className="p-2 md:p-4 bg-transparent">
              {/* THE REFINED TICKET UI */}
              <div
                ref={ticketRef}
                className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden mb-8 border border-slate-100"
                style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
              >
                {/* PDF BRANDING HEADER */}
                <div className="bg-[#7B1818] pt-12 md:pt-14 pb-10 md:pb-12 px-8 md:px-14 text-center relative overflow-hidden">
                  {/* Pattern Layer */}
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-4 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                      <Trophy className="text-[#D4AF37]" size={36} />
                    </div>

                    <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.25em] mb-2 leading-none drop-shadow-sm">
                      SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                      RUN
                    </h2>

                    <div className="flex items-center gap-4 w-full justify-center">
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-[#D4AF37] to-transparent"></div>
                      <p className="text-[#D4AF37] text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase whitespace-nowrap">
                        Official Entry Pass • 2026
                      </p>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* TICKET BODY */}
                <div className="px-8 md:px-14 py-10 md:py-12 bg-white relative">
                  {/* Top Row: Runner & Category */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative border-b border-slate-50 pb-10">
                    <div className="space-y-4 w-full md:w-auto">
                      <div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-2">
                          Pendaftar
                        </span>
                        <h3 className="text-2xl md:text-5xl font-black text-[#0F172A] uppercase leading-tight tracking-tight font-serif italic">
                          {result.fullName}
                        </h3>
                      </div>

                      <div className="flex items-center flex-wrap gap-3">
                        {result.paymentStatus === "paid" ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                            <ShieldCheck size={14} /> Bayaran Disahkan
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 font-black text-[9px] uppercase bg-amber-50 px-4 py-2 rounded-full border border-amber-100 shadow-sm">
                            <Clock size={14} /> Belum Berbayar
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                          <Fingerprint size={14} />{" "}
                          {result._id.slice(-10).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border-2 border-[#7B1818]/5 min-w-[120px] w-full md:w-auto justify-center gap-4 md:gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      <span className="text-[8px] font-black text-[#7B1818] uppercase tracking-widest opacity-60">
                        Category
                      </span>
                      <span className="text-3xl md:text-6xl font-black text-[#0F172A] leading-none">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* High Impact Data Grid */}
                  <div className="grid grid-cols-2 gap-5 md:gap-8 mb-12">
                    {/* BIB Block */}
                    <div className="group bg-[#7B1818] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white relative overflow-hidden shadow-xl shadow-[#7B1818]/15 transition-transform duration-500 hover:scale-[1.02]">
                      <Hash
                        className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700"
                        size={120}
                      />
                      <span className="text-[8px] md:text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                        BIB Number
                      </span>
                      <p className="text-3xl md:text-6xl font-black font-serif leading-none tracking-tighter">
                        #{result.bibNumber || "PENDING"}
                      </p>
                    </div>

                    {/* Jersey Block */}
                    <div className="group bg-[#0F172A] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/15 transition-transform duration-500 hover:scale-[1.02]">
                      <Shirt
                        className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700"
                        size={120}
                      />
                      <span className="text-[8px] md:text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                        Jersey Size
                      </span>
                      <p className="text-3xl md:text-6xl font-black leading-none tracking-tighter">
                        {result.jerseySize}
                      </p>
                    </div>
                  </div>

                  {/* Info Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16">
                    <div className="flex items-center gap-5 p-5 md:p-7 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                      <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-[#7B1818]/5 group-hover:bg-[#7B1818] group-hover:text-white transition-colors">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Venue
                        </p>
                        <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
                          Plaza Internatio, Surabaya
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 p-5 md:p-7 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                      <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-[#7B1818]/5 group-hover:bg-[#7B1818] group-hover:text-white transition-colors">
                        <Clock size={22} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Flag-Off Time
                        </p>
                        <p className="text-xs md:text-sm font-black text-slate-800 font-serif tracking-tight">
                          24 Mei 2026 • 06:00 WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR CODE SECTION - CALIBRATED FOR SCANNERS */}
                  <div className="flex flex-col items-center pt-10 border-t-2 border-dashed border-slate-100">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-[3.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="bg-white p-5 md:p-6 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-slate-50 mb-6 relative transition-transform duration-500 hover:rotate-2">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Race QR Code"
                            className="w-[150px] md:w-[180px] h-[150px] md:h-[180px] block"
                          />
                        ) : (
                          <div className="w-[150px] h-[150px] flex items-center justify-center bg-slate-50 rounded-2xl">
                            <Loader2 className="animate-spin text-slate-200" />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.6em] mb-4 text-center">
                      Sila imbas semasa pengambilan race pack
                    </p>

                    <div className="flex items-center gap-2 bg-slate-50 px-6 py-2 rounded-full border border-slate-100 shadow-inner">
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">
                        Official Verified Pass
                      </span>
                    </div>
                  </div>
                </div>

                {/* TICKET FOOTER */}
                <div className="bg-[#0F172A] py-10 md:py-12 text-center relative overflow-hidden">
                  {/* Small Star Decoration */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100">
                    <Star className="text-[#D4AF37]" size={16} fill="#D4AF37" />
                  </div>

                  <p className="text-white text-[9px] font-black tracking-[0.6em] uppercase opacity-40 mb-2">
                    WWW.SURABAYAHERITAGERUN.COM
                  </p>
                  <p className="text-white/20 text-[7px] md:text-[8px] uppercase tracking-widest px-8">
                    Sila bawa dokumen pengenalan diri asal (IC/Passport) untuk
                    pengesahan fizikal di lokasi acara.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION AREA (Outside PDF Capture) */}
            <div className="space-y-4">
              {result.paymentStatus === "paid" ? (
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="w-full bg-[#0F172A] hover:bg-black text-white py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {downloading ? (
                    <Loader2
                      className="animate-spin text-[#D4AF37]"
                      size={22}
                    />
                  ) : (
                    <Download
                      className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                      size={22}
                    />
                  )}

                  <span className="font-black tracking-[0.2em] uppercase text-xs md:text-sm">
                    {downloading
                      ? "Sila Tunggu..."
                      : "Muat Turun E-Tiket (PDF)"}
                  </span>
                </button>
              ) : (
                <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] text-center shadow-xl">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100">
                    <Clock size={32} />
                  </div>
                  <h4 className="text-slate-900 font-black uppercase text-sm tracking-widest mb-2">
                    Pembayaran Tertangguh
                  </h4>
                  <p className="text-slate-400 text-xs mb-8 max-w-[250px] mx-auto">
                    Sila selesaikan pembayaran anda untuk menjana e-tiket rasmi
                    acara.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/payment", { state: { userData: result } })
                    }
                    className="bg-[#7B1818] text-white px-12 py-5 rounded-full font-black text-xs shadow-[0_15px_30px_-5px_rgba(123,24,24,0.3)] active:scale-95 hover:bg-black transition-all uppercase tracking-widest"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Section */}
        {!result && !loading && (
          <div className="text-center mt-12 animate-fade-in-up">
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-6">
              Bantuan Teknikal
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Fingerprint size={16} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-500">
                  Manual Verification
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Aesthetics */}
      <style>{`
         .animate-fade-in-up { 
           animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
         }
         @keyframes fadeInUp { 
           from { opacity: 0; transform: translateY(30px); } 
           to { opacity: 1; transform: translateY(0); } 
         }
         ::-webkit-scrollbar { width: 6px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 10px; }
         
         /* Ensure High Resolution Rendering */
         img { image-rendering: -webkit-optimize-contrast; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
