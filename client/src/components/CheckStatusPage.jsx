import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import confetti from "canvas-confetti"; // Import Confetti
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

  // Fungsi untuk menjalankan selebrasi konfeti
  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Tembakkan dari dua sisi
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Masukkan email Anda.");
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
          color: { dark: "#7B1818", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);

        // Jalankan selebrasi jika status lunas
        if (res.data.data.paymentStatus === "paid") {
          fireConfetti();
        }

        setTimeout(() => setIsTicketLoaded(true), 300);
      }
    } catch (err) {
      setError("Pendaftaran tidak ditemukan. Sila periksa semula email anda.");
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
        backgroundColor: "#FDFBF7",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`SHR2026_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Gagal memuat turun tiket.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 overflow-x-hidden">
      {/* Header dengan efek gradien premium */}
      <div className="relative h-[35vh] bg-[#7B1818] overflow-hidden rounded-b-[4rem] shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="relative z-10 text-center px-4 pt-12">
          <button
            onClick={() => navigate("/")}
            className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Semak <span className="text-[#D4AF37]">Status</span>
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-20 pb-24">
        {/* Search Input */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 transition-all">
          <form
            onSubmit={handleCheck}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                size={20}
              />
              <input
                type="email"
                placeholder="Email pendaftaran anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-[#7B1818] text-lg transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7B1818] hover:bg-black text-white font-black px-10 py-5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <History size={20} />
              )}
              SEMAK
            </button>
          </form>
          {error && (
            <div className="mt-4 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* E-Ticket Display */}
        {result && (
          <div
            className={`transition-all duration-1000 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div
              ref={ticketRef}
              className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-8"
            >
              <div className="bg-gradient-to-r from-[#7B1818] via-[#9B1B1B] to-[#7B1818] h-5"></div>

              <div className="p-10 md:p-14">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                      Official Entry Pass
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase leading-none">
                      {result.fullName}
                    </h2>
                    <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs uppercase bg-green-50 px-3 py-1 rounded-full w-fit">
                      <ShieldCheck size={14} /> Terverifikasi Lunas
                    </div>
                  </div>
                  <div className="bg-[#7B1818] text-white p-6 rounded-[2.5rem] shadow-xl min-w-[100px] border-4 border-white">
                    <span className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1 font-sans">
                      Kat
                    </span>
                    <span className="text-4xl font-black leading-none">
                      {result.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-12">
                  <div className="bg-[#FDF2F2] p-8 rounded-[2.5rem] border border-red-50 relative overflow-hidden">
                    <Hash
                      className="absolute -right-4 -bottom-4 text-[#7B1818]/5 rotate-12"
                      size={120}
                    />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Nomor BIB
                    </span>
                    <p className="text-5xl font-black text-[#7B1818] mt-2 font-serif">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                    <Shirt
                      className="absolute -right-4 -bottom-4 text-slate-200/40 rotate-12"
                      size={120}
                    />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Saiz Jersi
                    </span>
                    <p className="text-5xl font-black text-slate-900 mt-2 uppercase">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-[#7B1818]">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Venue
                      </p>
                      <p className="text-sm font-black">
                        Plaza Internatio, Surabaya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-[#7B1818]">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Tarikh
                      </p>
                      <p className="text-sm font-black">
                        24 Mei 2026 | 06:00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-8 border-t border-dashed border-slate-200">
                  <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100 mb-6 transition-transform hover:scale-105">
                    <img
                      src={qrDataUrl}
                      alt="Race QR"
                      className="w-[180px] h-[180px] block"
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">
                    Scan Me at Venue
                  </p>
                </div>
              </div>

              <div className="bg-[#0F172A] p-8 text-center relative">
                <p className="text-white text-[11px] font-black tracking-[0.5em] uppercase opacity-80">
                  Surabaya Heritage Run 2026
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full bg-[#0F172A] hover:bg-black text-white py-7 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:-translate-y-2 disabled:opacity-70 group"
            >
              {downloading ? (
                <Loader2 className="animate-spin text-[#D4AF37]" />
              ) : (
                <Download className="text-[#D4AF37] group-hover:animate-bounce" />
              )}
              <span className="font-black tracking-[0.3em] uppercase text-sm">
                {downloading ? "Menjana PDF..." : "Muat Turun E-Ticket (PDF)"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatusPage;
