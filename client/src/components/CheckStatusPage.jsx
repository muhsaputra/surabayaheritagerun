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

  // Ref untuk capture tiket
  const ticketRef = useRef(null);

  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  // Selebrasi Pemenang (Paid Status)
  const fireConfetti = () => {
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });

    confetti({
      shapes: [triangle],
      particleCount: 80,
      spread: 70,
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

        // QR Code Hitam Pekat untuk akurasi pindaian mobile
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
      setError("Email tidak ditemukan. Sila periksa semula.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      // Tunggu visualisasi stabil sebelum snapshot
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 4, // Resolusi Ultra-HD untuk cetak A4
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Centering image on A4
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Ticket_SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("Gagal menjana PDF. Sila cuba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] selection:bg-[#7B1818]/10">
      {/* Dynamic Header Section */}
      <div className="relative h-[30vh] md:h-[40vh] bg-[#7B1818] rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B1818] to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 md:mb-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto text-sm font-bold"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2">
            Semak <span className="text-[#D4AF37]">Tiket</span>
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 relative z-20 pb-24 transition-all">
        {/* Search Interface */}
        <div className="bg-white p-2.5 md:p-3 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] mb-8 flex flex-col md:flex-row gap-2 border border-white">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
              size={20}
            />
            <input
              type="email"
              placeholder="Email pendaftaran"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-[#7B1818] text-base md:text-lg transition-all outline-none"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-black px-10 py-4 md:py-5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl active:scale-95 text-sm md:text-base"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <History size={20} />
            )}
            CEK STATUS
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3 animate-fade-in-up">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-bold text-xs md:text-sm">{error}</p>
          </div>
        )}

        {/* E-Ticket Display Container */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* THE RESPONSIVE TICKET */}
            <div
              ref={ticketRef}
              className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden mb-8 border border-slate-100"
            >
              {/* PDF Header Stripe */}
              <div className="bg-[#7B1818] pt-8 md:pt-12 pb-6 md:pb-8 px-6 md:px-12 text-center relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em] mb-1">
                    SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                    RUN
                  </h2>
                  <p className="text-[#D4AF37] text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase">
                    Official Entry Pass • 2026
                  </p>
                </div>
              </div>

              <div className="px-6 md:px-14 py-8 md:py-12 bg-white">
                {/* Personal Identity Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-10 md:mb-14">
                  <div className="space-y-3 w-full md:w-auto">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] block">
                      Runner Identity
                    </span>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-none tracking-tighter break-words">
                      {result.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 w-fit">
                      <ShieldCheck size={14} /> Payment Verified
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 border-[#7B1818] min-w-[100px] w-full md:w-auto justify-center gap-4 md:gap-1">
                    <span className="text-[8px] md:text-[9px] font-black text-[#7B1818] uppercase tracking-widest">
                      Category
                    </span>
                    <span className="text-3xl md:text-5xl font-black text-slate-900 leading-none">
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* Key Race Data Blocks */}
                <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-14">
                  <div className="bg-[#7B1818] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] text-white shadow-xl shadow-red-900/20 relative overflow-hidden group">
                    <Hash
                      className="absolute -right-4 -bottom-4 opacity-5 rotate-12"
                      size={80}
                    />
                    <span className="text-[8px] md:text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                      Bib Number
                    </span>
                    <p className="text-4xl md:text-6xl font-black font-serif leading-none">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                    <Shirt
                      className="absolute -right-4 -bottom-4 opacity-5 rotate-12"
                      size={80}
                    />
                    <span className="text-[8px] md:text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                      Jersey Size
                    </span>
                    <p className="text-4xl md:text-6xl font-black uppercase leading-none">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                {/* Race Schedule & Venue Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 md:mb-16">
                  <div className="flex items-center gap-4 md:gap-5 p-5 md:p-7 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#7B1818]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Race Venue
                      </p>
                      <p className="text-xs md:text-base font-black text-slate-800">
                        Plaza Internatio, Surabaya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-5 p-5 md:p-7 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#7B1818]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Start Time
                      </p>
                      <p className="text-xs md:text-base font-black text-slate-800">
                        24 May | 06:00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optimized QR Section */}
                <div className="flex flex-col items-center pt-8 md:pt-12 border-t-2 border-dashed border-slate-100">
                  <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-50 mb-6 transition-all active:scale-95">
                    {/* QR Code Hitam Pekat untuk akurasi pindaian mobile panitia */}
                    <img
                      src={qrDataUrl}
                      alt="Official Race QR"
                      className="w-[160px] md:w-[220px] h-[160px] md:h-[220px] block"
                    />
                  </div>
                  <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] mb-3">
                    Runner Verification Code
                  </p>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <User size={12} className="text-[#7B1818]" />
                    <span className="text-[8px] md:text-[9px] font-mono font-black text-slate-400 uppercase">
                      ID: {result._id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aesthetic Ticket Bottom Footer */}
              <div className="bg-slate-900 py-8 md:py-10 text-center relative">
                <p className="text-white text-[9px] font-black tracking-[0.5em] uppercase opacity-40">
                  www.surabayaheritagerun.com
                </p>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Functional Action Area */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-6 md:py-7 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-70 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Download className="text-[#D4AF37] group-hover:animate-bounce" />
                )}
                <span className="font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm">
                  {downloading
                    ? "Generating PDF..."
                    : "Download E-Ticket (PDF A4)"}
                </span>
              </button>
            ) : (
              <div className="p-8 bg-[#FDF2F2] border border-red-100 rounded-[3rem] text-center">
                <p className="text-[#9B1B1B] font-black text-sm uppercase tracking-widest mb-4">
                  Pending Payment
                </p>
                <button
                  onClick={() =>
                    navigate("/payment", { state: { userData: result } })
                  }
                  className="bg-[#9B1B1B] text-white px-10 py-4 rounded-full font-black text-sm shadow-xl shadow-red-900/20 active:scale-95"
                >
                  PAY NOW
                </button>
              </div>
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
