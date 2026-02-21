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

  // Ref ini menunjuk ke kartu tiket utama untuk proses PDF
  const ticketRef = useRef(null);

  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  // Efek Selebrasi Konfeti Premium
  const fireConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#7B1818", "#D4AF37", "#0F172A"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
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

        // Generate QR Code Warna Hitam (#000000) untuk stabilitas scan maksimal
        const qrUrl = await QRCode.toDataURL(res.data.data._id, {
          width: 800,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);

        // Jalankan konfeti jika status sudah bayar (Paid)
        if (res.data.data.paymentStatus === "paid") {
          fireConfetti();
        }

        setTimeout(() => setIsTicketLoaded(true), 300);
      }
    } catch (err) {
      setError("Data pendaftaran tidak ditemukan. Pastikan email anda benar.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Final Download PDF A4
  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      // Jeda sinkronisasi agar aset gambar Base64 ter-render sempurna
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // High-quality DPI agar teks tajam saat dicetak A4
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Inisialisasi PDF standar A4 (Portrait)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Sisipkan gambar tiket ke dokumen PDF
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Ticket_SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Generate Error:", err);
      alert("Terjadi masalah saat membuat file PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden relative">
      {/* Background Decor (Heritage Maroon) */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-[#7B1818] z-0 rounded-b-[4rem] shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-10 text-white">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 font-bold bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition-all backdrop-blur-md border border-white/5"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Beranda
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70">
              Heritage Pass
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10 text-white">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-3">
            Semak Status
          </h1>
          <p className="text-white/70 font-medium tracking-wide">
            Masukkan email untuk memuat turun e-ticket anda.
          </p>
        </div>

        {/* Search Engine UI */}
        <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] mb-12 flex flex-col md:flex-row gap-3 relative overflow-hidden group">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-hover:text-[#7B1818]"
              size={22}
            />
            <input
              type="email"
              placeholder="alamat.email@anda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-[#7B1818]/20 text-lg transition-all outline-none"
            />
          </div>
          <button
            type="submit"
            onClick={handleCheck}
            disabled={loading}
            className="bg-[#7B1818] hover:bg-[#5a1212] text-white font-black px-12 py-5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <History size={20} />
            )}
            CARI DATA
          </button>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 flex items-center gap-4 animate-fade-in-up shadow-sm">
            <AlertCircle size={24} className="shrink-0" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Ticket Visualization (Captured for PDF) */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Ticket Card Container */}
            <div
              ref={ticketRef}
              className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden mb-10 border border-slate-100 relative"
            >
              {/* Header Ticket (A4 Branding) */}
              <div className="bg-[#7B1818] p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-1">
                    SURABAYA <span className="text-[#D4AF37]">HERITAGE</span>{" "}
                    RUN
                  </h2>
                  <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.5em] uppercase">
                    Official Runner Entry Pass • 2026
                  </p>
                </div>
              </div>

              <div className="p-10 md:p-14 bg-white relative">
                {/* Watermark Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <Trophy size={400} />
                </div>

                {/* Participant Name & Category */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                      Nama Lengkap
                    </span>
                    <h3 className="text-4xl font-black text-slate-900 uppercase leading-tight tracking-tighter">
                      {result.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 w-fit">
                      <ShieldCheck size={14} /> Terverifikasi Lunas
                    </div>
                  </div>
                  <div className="flex flex-col items-center bg-white p-6 rounded-[2.5rem] border-4 border-[#7B1818] min-w-[110px] shadow-lg">
                    <span className="text-[9px] font-black text-[#7B1818] uppercase tracking-widest mb-1">
                      Kategori
                    </span>
                    <span className="text-4xl font-black text-slate-900 leading-none">
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* Key Race Data (BIB & Jersey) */}
                <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                  <div className="bg-[#7B1818] p-8 rounded-[3rem] text-white shadow-2xl shadow-red-900/20">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                      Nomor BIB
                    </span>
                    <p className="text-5xl font-black font-serif tracking-tight">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 block">
                      Saiz Jersi
                    </span>
                    <p className="text-5xl font-black uppercase tracking-tighter">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 relative z-10">
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-[#7B1818]">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Tempat Pelepasan
                      </p>
                      <p className="text-sm font-black text-slate-800">
                        Plaza Internatio, Surabaya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-[#7B1818]">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Tarikh & Masa
                      </p>
                      <p className="text-sm font-black text-slate-800">
                        24 Mei 2026 | 06:00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                {/* High-Contrast QR Code for A4 */}
                <div className="flex flex-col items-center pt-10 border-t border-dashed border-slate-200 relative z-10">
                  <div className="bg-white p-5 rounded-[3rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 mb-6 transform transition-transform hover:scale-105 active:scale-95">
                    {/* QR Code Hitam Pekat untuk Pemindaian Terbaik di PDF */}
                    <img
                      id="main-qr-code"
                      src={qrDataUrl}
                      alt="Runner QR Code"
                      className="w-[200px] h-[200px] block"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mb-3">
                    Imbas semasa pengambilan Race Pack
                  </p>
                  <div className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-full">
                    <Check size={14} className="text-[#7B1818]" />
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-tighter">
                      ID: {result._id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Tiket (Bottom Stripe) */}
              <div className="bg-slate-900 p-8 text-center relative">
                <p className="text-white text-[9px] font-black tracking-[0.5em] uppercase opacity-60">
                  Sila bawa dokumen asal untuk verifikasi
                </p>
              </div>
            </div>

            {/* Download Button (A4 Optimized) */}
            {result.paymentStatus === "paid" && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-slate-900 text-white font-black py-7 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] flex items-center justify-center gap-4 transition-all hover:bg-black hover:-translate-y-2 active:scale-95 disabled:opacity-70 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Download className="text-[#D4AF37] group-hover:animate-bounce" />
                )}
                <span className="tracking-[0.3em] text-sm uppercase">
                  {downloading
                    ? "Menjana Dokumen A4..."
                    : "Muat Turun Tiket (PDF)"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
         .animate-fade-in-up { 
           animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
         }
         @keyframes fadeInUp { 
           from { opacity: 0; transform: translateY(30px); } 
           to { opacity: 1; transform: translateY(0); } 
         }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
