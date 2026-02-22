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
      particleCount: 150,
      spread: 90,
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
      // Jeda krusial agar browser menyelesaikan rendering shadow dan QR
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 4, // Resolusi Ultra-HD untuk hasil cetak tajam
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Menghilangkan deviasi scroll saat capture
        windowWidth: ticketRef.current.scrollWidth,
        windowHeight: ticketRef.current.scrollHeight,
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

      // Fit gambar ke A4 secara presisi
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
      {/* Search Section Header */}
      <div className="relative h-[25vh] md:h-[30vh] bg-[#7B1818] rounded-b-[4rem] overflow-hidden shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Beranda
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="text-[#D4AF37]" size={20} />
            <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tighter">
              Race <span className="text-[#D4AF37]">Checker</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-10 md:-mt-12 relative z-20 pb-20">
        {/* Search Bar UI */}
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-full shadow-2xl mb-12 flex flex-col md:flex-row gap-2 border border-white/50">
          <div className="relative flex-1">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type="email"
              placeholder="Masukkan email pendaftaran"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 rounded-full bg-transparent border-none focus:ring-0 text-sm font-medium"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} />
            )}{" "}
            SEMAK
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-fade-in-up">
            <AlertCircle size={18} />{" "}
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* PDF TICKET CONTAINER */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <div
              ref={ticketRef}
              className="bg-white p-4 md:p-6 overflow-hidden"
            >
              {" "}
              {/* Container luar untuk menjaga margin A4 */}
              <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-[0_15px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                {/* Heritage Header Stripe */}
                <div className="bg-[#7B1818] pt-10 pb-8 px-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <Trophy className="text-[#D4AF37] mb-3" size={32} />
                    <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.25em] mb-1 leading-none">
                      SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                      RUN
                    </h2>
                    <div className="h-[1.5px] w-20 bg-[#D4AF37]/50 mb-2"></div>
                    <p className="text-[#D4AF37] text-[9px] font-black tracking-[0.4em] uppercase">
                      Official Entry Pass • 2026
                    </p>
                  </div>
                </div>

                <div className="px-8 md:px-12 py-10 bg-white relative">
                  {/* Identity Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] block mb-1">
                          Runner Identity
                        </span>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase leading-tight font-serif italic tracking-tight">
                          {result.fullName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-emerald-600 font-black text-[9px] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <ShieldCheck size={12} /> Verified
                        </div>
                        <span className="text-slate-300 font-bold text-[9px]">
                          ID: {result._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-[#FDFBF7] p-4 rounded-[1.5rem] border-2 border-[#7B1818]/10 min-w-[110px] shadow-sm">
                      <span className="text-[8px] font-black text-[#7B1818] uppercase tracking-widest opacity-60 mb-1">
                        Category
                      </span>
                      <span className="text-2xl md:text-4xl font-black text-slate-900 leading-none">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* High Consistency Data Grid */}
                  <div className="grid grid-cols-2 gap-5 mb-12">
                    <div className="bg-[#7B1818] p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-[#7B1818]/20">
                      <Hash
                        className="absolute -right-3 -bottom-3 opacity-10 rotate-12"
                        size={90}
                      />
                      <span className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                        BIB Number
                      </span>
                      <p className="text-3xl md:text-5xl font-black font-serif leading-none tracking-tighter">
                        #{result.bibNumber || "---"}
                      </p>
                    </div>
                    <div className="bg-[#0F172A] p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-[#0F172A]/20">
                      <Shirt
                        className="absolute -right-3 -bottom-3 opacity-10 rotate-12"
                        size={90}
                      />
                      <span className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em] mb-1 block">
                        Jersey Size
                      </span>
                      <p className="text-3xl md:text-5xl font-black uppercase leading-none">
                        {result.jerseySize}
                      </p>
                    </div>
                  </div>

                  {/* Compact Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <div className="bg-white w-9 h-9 rounded-lg shadow-sm text-[#7B1818] flex items-center justify-center">
                        <MapPin size={18} />
                      </div>
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
                      <div className="bg-white w-9 h-9 rounded-lg shadow-sm text-[#7B1818] flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
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

                  {/* Precision QR Code */}
                  <div className="flex flex-col items-center pt-8 border-t-2 border-dashed border-slate-100">
                    <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100 mb-5">
                      <img
                        src={qrDataUrl}
                        alt="QR"
                        className="w-[150px] md:w-[180px] h-[150px] md:h-[180px] block"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.5em] mb-1">
                      Scan at Venue Counter
                    </p>
                  </div>
                </div>

                <div className="bg-[#0F172A] py-8 text-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                    <Star className="text-[#D4AF37]" size={12} fill="#D4AF37" />
                  </div>
                  <p className="text-white text-[8px] font-black tracking-[0.6em] uppercase opacity-40">
                    www.surabayaheritagerun.com
                  </p>
                </div>
              </div>
            </div>

            {/* Action Controller */}
            {result.paymentStatus === "paid" && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={18} />
                ) : (
                  <Download
                    className="text-[#D4AF37] group-hover:animate-bounce"
                    size={18}
                  />
                )}
                <span className="font-black tracking-[0.2em] uppercase text-xs">
                  {downloading
                    ? "Menjana Dokumen..."
                    : "UNDUH E-TIKET (PDF A4)"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
