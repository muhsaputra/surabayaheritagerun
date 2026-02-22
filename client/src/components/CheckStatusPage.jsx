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
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });
    confetti({
      shapes: [triangle],
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#7B1818", "#D4AF37", "#0F172A"],
    });
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Masukkan email pendaftaran anda.");
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
      setError("Email tidak ditemukan. Sila periksa semula email anda.");
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
        scale: 3, // Skala optimal untuk ketajaman A4 tanpa membesarkan teks berlebih
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
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

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("Gagal menjana tiket PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden">
      {/* Header Section - Reduced Height for Balance */}
      <div className="relative h-[30vh] md:h-[35vh] bg-[#7B1818] rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B1818] via-transparent to-black/30"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Kembali
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="text-[#D4AF37]" size={24} />
            <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Race <span className="text-[#D4AF37]">Checker</span>
            </h1>
          </div>
          <p className="text-white/60 text-xs md:text-sm font-medium">
            Masukkan email untuk akses tiket resmi 2026
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 md:px-6 -mt-12 md:-mt-16 relative z-20 pb-32">
        {/* Search Interface - Refined Sizing */}
        <div className="bg-white/90 backdrop-blur-xl p-2 md:p-2.5 rounded-[2.5rem] shadow-[0_20px_40px_-12px_rgba(123,24,24,0.15)] mb-10 flex flex-col md:flex-row gap-2 border border-white relative group">
          <div className="relative flex-1">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-full bg-slate-50/50 border-none focus:ring-1 focus:ring-[#7B1818]/20 text-sm transition-all outline-none font-medium"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-8 py-4 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-xs tracking-widest uppercase"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} className="fill-current" />
            )}
            SEMAK
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-fade-in-up">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* E-Ticket Display Container */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* THE REFINED TICKET UI */}
            <div
              ref={ticketRef}
              className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)] overflow-hidden mb-8 border border-slate-100"
            >
              {/* PDF Header Stripe - More Balanced */}
              <div className="bg-[#7B1818] pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <Trophy className="text-[#D4AF37] mb-2" size={30} />
                  <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em] mb-1 leading-none">
                    SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                    RUN
                  </h2>
                  <p className="text-[#D4AF37] text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase">
                    Official Entry Pass • 2026
                  </p>
                </div>
              </div>

              <div className="px-6 md:px-12 py-8 md:py-10 bg-white relative">
                {/* Personal Identity Section - Cleaner Font Sizes */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 relative">
                  <div className="space-y-3 w-full md:w-auto">
                    <div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] block mb-1">
                        Runner Identity
                      </span>
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase leading-tight tracking-tight font-serif">
                        {result.fullName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <ShieldCheck size={12} /> Verified
                      </div>
                      <span className="text-slate-300 font-bold text-[10px]">
                        #{result._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-2 border-[#7B1818]/10 min-w-[100px] w-full md:w-auto justify-center gap-4 md:gap-1 shadow-sm">
                    <span className="text-[8px] font-black text-[#7B1818] uppercase tracking-widest opacity-60">
                      Category
                    </span>
                    <span className="text-2xl md:text-4xl font-black text-slate-900 leading-none">
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* Key Race Data Grid - Balanced Proportions */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                  <div className="bg-gradient-to-br from-[#7B1818] to-[#9B1B1B] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white relative overflow-hidden group shadow-lg">
                    <Hash
                      className="absolute -right-4 -bottom-4 opacity-10 rotate-12"
                      size={100}
                    />
                    <span className="text-[8px] md:text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                      BIB Number
                    </span>
                    <p className="text-3xl md:text-2xl font-black font-serif leading-none tracking-tighter">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white relative overflow-hidden group shadow-lg">
                    <Shirt
                      className="absolute -right-4 -bottom-4 opacity-10 rotate-12"
                      size={100}
                    />
                    <span className="text-[8px] md:text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                      Jersey Size
                    </span>
                    <p className="text-3xl md:text-2xl font-black uppercase leading-none">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                {/* Event Schedule Info - Smaller & More Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-14">
                  <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50 rounded-[1.2rem] md:rounded-[1.8rem] border border-slate-100 shadow-sm">
                    <div className="bg-white w-10 h-10 rounded-xl shadow-sm text-[#7B1818] flex items-center justify-center border border-red-50">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Venue
                      </p>
                      <p className="text-[11px] md:text-sm font-black text-slate-800 uppercase">
                        Plaza Internatio, SBY
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50 rounded-[1.2rem] md:rounded-[1.8rem] border border-slate-100 shadow-sm">
                    <div className="bg-white w-10 h-10 rounded-xl shadow-sm text-[#7B1818] flex items-center justify-center border border-red-50">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Flag-Off
                      </p>
                      <p className="text-[11px] md:text-sm font-black text-slate-800 font-serif">
                        24 Mei | 06:00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Precision QR Section - Reduced Sizing for Elegance */}
                <div className="flex flex-col items-center pt-8 md:pt-10 border-t-2 border-dashed border-slate-100">
                  <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-50 mb-6 transition-all hover:scale-[1.02]">
                    <img
                      src={qrDataUrl}
                      alt="QR"
                      className="w-[140px] md:w-[180px] h-[140px] md:h-[180px] block"
                    />
                  </div>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-4 text-center">
                    Scan At Counter
                  </p>
                  <div className="flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
                    <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">
                      Auth-ID: {result._id.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer - Symmetrical */}
              <div className="bg-[#0F172A] py-8 md:py-10 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100">
                  <Star className="text-[#D4AF37]" size={14} fill="#D4AF37" />
                </div>
                <p className="text-white text-[9px] font-black tracking-[0.6em] uppercase opacity-40 mb-1">
                  www.surabayaheritagerun.com
                </p>
                <p className="text-white/20 text-[7px] uppercase tracking-widest tracking-tighter">
                  © 2026 Surabaya Heritage Run
                </p>
              </div>
            </div>

            {/* Action Controller - Modern & Sized */}
            {result.paymentStatus === "paid" && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                ) : (
                  <Download
                    className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                    size={20}
                  />
                )}
                <span className="font-black tracking-[0.2em] uppercase text-[11px] md:text-sm">
                  {downloading ? "Menjana PDF..." : "UNDUH E-TIKET (PDF A4)"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
         ::-webkit-scrollbar { width: 5px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 5px; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
