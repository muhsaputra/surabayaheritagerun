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

  // Selebrasi Pemenang (Paid Status) dengan skema warna Heritage
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

        // QR Code Hitam Pekat untuk akurasi pindaian mobile panitia
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
        scale: 4, // Ultra-HD Quality untuk cetak fisik A4
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

      // Render image di bagian atas A4 dengan margin yang pas
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("Gagal menjana tiket PDF. Sila coba kembali.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#0F172A] overflow-x-hidden">
      {/* Dynamic Header Section */}
      <div className="relative h-[35vh] md:h-[45vh] bg-[#7B1818] rounded-b-[4rem] md:rounded-b-[6rem] overflow-hidden shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B1818] via-transparent to-black/30"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 text-center flex flex-col items-center">
          <button
            onClick={() => navigate("/")}
            className="mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Kembali Ke Home
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="text-[#D4AF37]" size={32} />
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              Race <span className="text-[#D4AF37]">Checker</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-sm">
            Masukkan email anda untuk mengakses tiket resmi Surabaya Heritage
            Run 2026
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 relative z-20 pb-32">
        {/* Modern Search Interface */}
        <div className="bg-white/80 backdrop-blur-xl p-2.5 md:p-3 rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(123,24,24,0.2)] mb-10 flex flex-col md:flex-row gap-2 border border-white relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B1818]/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
              size={22}
            />
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-full bg-slate-50/50 border-none focus:ring-2 focus:ring-[#7B1818]/20 text-lg transition-all outline-none font-medium"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-black text-white font-black px-12 py-5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl active:scale-95 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Zap size={20} className="fill-current" />
              )}
              CEK STATUS
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </button>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-4 animate-fade-in-up">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* E-Ticket Display Container */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* THE RESPONSIVE TICKET UI */}
            <div
              ref={ticketRef}
              className="bg-white rounded-[3rem] md:rounded-[4.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden mb-10 border border-slate-100"
            >
              {/* PDF Header Stripe */}
              <div className="bg-[#7B1818] pt-12 md:pt-16 pb-10 md:pb-12 px-6 md:px-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <Trophy className="text-[#D4AF37] mb-4" size={40} />
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.25em] mb-2 leading-none drop-shadow-lg">
                    SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                    RUN
                  </h2>
                  <div className="h-0.5 w-24 bg-[#D4AF37] mb-3"></div>
                  <p className="text-[#D4AF37] text-[10px] md:text-[12px] font-black tracking-[0.5em] uppercase">
                    Official Race Entry Pass • 2026
                  </p>
                </div>
              </div>

              <div className="px-6 md:px-16 py-10 md:py-14 bg-white relative">
                {/* Personal Identity Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-10 mb-12 md:mb-16 relative">
                  <div className="space-y-4 w-full md:w-auto">
                    <div>
                      <span className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-2">
                        Runner Identity
                      </span>
                      <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-none tracking-tighter break-words font-serif">
                        {result.fullName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] md:text-[11px] uppercase bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                        <ShieldCheck size={16} /> Verified Entry
                      </div>
                      <div className="text-slate-400 font-bold text-xs">
                        #{result._id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center bg-[#FDFBF7] p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border-4 border-[#7B1818]/10 min-w-[120px] w-full md:w-auto justify-center gap-6 md:gap-2 shadow-inner">
                    <span className="text-[9px] md:text-[10px] font-black text-[#7B1818] uppercase tracking-widest opacity-60">
                      Category
                    </span>
                    <span className="text-4xl md:text-6xl font-black text-slate-900 leading-none">
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* Key Race Data Grid */}
                <div className="grid grid-cols-2 gap-6 md:gap-10 mb-12 md:mb-16">
                  <div className="bg-gradient-to-br from-[#7B1818] to-[#9B1B1B] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-[0_20px_40px_-15px_rgba(123,24,24,0.4)] relative overflow-hidden group">
                    <Hash
                      className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500"
                      size={140}
                    />
                    <span className="text-[10px] md:text-[12px] font-black uppercase opacity-60 tracking-[0.3em] mb-3 block">
                      BIB Number
                    </span>
                    <p className="text-5xl md:text-8xl font-black font-serif leading-none tracking-tighter">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)] relative overflow-hidden group">
                    <Shirt
                      className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500"
                      size={140}
                    />
                    <span className="text-[10px] md:text-[12px] font-black uppercase opacity-60 tracking-[0.3em] mb-3 block">
                      Jersey Size
                    </span>
                    <p className="text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                {/* Event Schedule Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-12 md:mb-20">
                  <div className="flex items-center gap-6 p-7 md:p-9 bg-[#FDFBF7] rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-white w-14 h-14 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-red-50">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Race Venue
                      </p>
                      <p className="text-base md:text-xl font-black text-slate-800">
                        Plaza Internatio, Surabaya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 p-7 md:p-9 bg-[#FDFBF7] rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-white w-14 h-14 rounded-2xl shadow-sm text-[#7B1818] flex items-center justify-center border border-red-50">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Flag-Off Time
                      </p>
                      <p className="text-base md:text-xl font-black text-slate-800 font-serif">
                        24 May | 06:00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Precision QR Section */}
                <div className="flex flex-col items-center pt-12 md:pt-16 border-t-4 border-double border-slate-100">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-[#D4AF37]/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-white p-5 md:p-8 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-2 border-slate-50 mb-8 relative transition-all group-hover:scale-[1.02]">
                      <img
                        src={qrDataUrl}
                        alt="SHR2026 QR"
                        className="w-[180px] md:w-[260px] h-[180px] md:h-[260px] block rounded-xl"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] md:text-[13px] text-slate-400 font-black uppercase tracking-[0.6em] mb-6 text-center">
                    Imbas Di Kaunter Race Pack
                  </p>
                  <div className="flex items-center gap-3 bg-slate-50 px-8 py-3 rounded-full border border-slate-100 shadow-inner">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                    <span className="text-[10px] md:text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider">
                      Auth-ID: {result._id.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Brand Footer */}
              <div className="bg-[#0F172A] py-12 md:py-16 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100">
                  <Star className="text-[#D4AF37]" size={20} fill="#D4AF37" />
                </div>
                <p className="text-white text-[10px] md:text-[12px] font-black tracking-[0.8em] uppercase opacity-40 mb-2">
                  www.surabayaheritagerun.com
                </p>
                <p className="text-white/20 text-[9px] uppercase tracking-widest">
                  © Surabaya Heritage Run • Persatuan Atletik Seluruh Indonesia
                </p>
              </div>
            </div>

            {/* Action Controller */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-8 md:py-10 rounded-[3rem] md:rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)] flex items-center justify-center gap-5 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-70 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
                ) : (
                  <Download
                    className="text-[#D4AF37] group-hover:animate-bounce transition-all"
                    size={28}
                  />
                )}
                <span className="font-black tracking-[0.3em] md:tracking-[0.4em] uppercase text-sm md:text-lg">
                  {downloading
                    ? "Menjana Dokumen A4..."
                    : "UNDUH E-TICKET (PDF)"}
                </span>
              </button>
            ) : (
              <div className="p-10 bg-gradient-to-br from-[#FDF2F2] to-white border-2 border-red-100 rounded-[4rem] text-center shadow-xl">
                <ShieldCheck
                  className="mx-auto text-[#9B1B1B] mb-4 opacity-40"
                  size={48}
                />
                <p className="text-[#9B1B1B] font-black text-lg uppercase tracking-widest mb-6">
                  Pembayaran Tertangguh
                </p>
                <button
                  onClick={() =>
                    navigate("/payment", { state: { userData: result } })
                  }
                  className="bg-[#9B1B1B] text-white px-16 py-6 rounded-full font-black text-base shadow-[0_20px_40px_-10px_rgba(155,27,27,0.4)] active:scale-95 hover:bg-black transition-all uppercase tracking-[0.2em]"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Aesthetics */}
      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
         ::-webkit-scrollbar { width: 8px; }
         ::-webkit-scrollbar-track { background: #FDFBF7; }
         ::-webkit-scrollbar-thumb { background: #7B1818; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
