import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
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

  // Ref ini sekarang menunjuk ke kartu tiket yang terlihat oleh user
  const ticketRef = useRef(null);

  useEffect(() => {
    let autoEmail = location.state?.email || searchParams.get("email");
    if (autoEmail) setEmail(autoEmail);
  }, [location, searchParams]);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Masukkan email Anda.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await axios.post(`${apiUrl}/api/check-status`, { email });

      if (res.data.success) {
        setResult(res.data.data);

        // Generate QR as Static Image segera setelah data ditemukan
        const qrUrl = await QRCode.toDataURL(res.data.data._id, {
          width: 600,
          margin: 1,
          color: { dark: "#7B1818", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);
        setTimeout(() => setIsTicketLoaded(true), 300);
      }
    } catch (err) {
      setError("Pendaftaran tidak ditemukan. Pastikan email Anda benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !result) return;
    setDownloading(true);

    try {
      // Jeda krusial agar UI benar-benar stabil di layar HP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Kualitas Tinggi
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Teknik Paksa: Memastikan gambar di-render ulang saat kloning
        onclone: (clonedDoc) => {
          const qr = clonedDoc.getElementById("main-qr-code");
          if (qr) qr.style.visibility = "visible";
        },
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
      alert("Gagal mengunduh. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 overflow-x-hidden">
      {/* Hero Header */}
      <div className="relative h-80 bg-[#7B1818] overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]"></div>
        <div className="relative z-10 text-center px-4 pt-12">
          <button
            onClick={() => navigate("/")}
            className="mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Status <span className="text-[#D4AF37]">Pendaftaran</span>
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-24 relative z-20 pb-24">
        {/* Search Card */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10">
          <form
            onSubmit={handleCheck}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="email"
              placeholder="Alamat email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 pl-6 pr-6 py-5 rounded-full bg-slate-50 border-none text-lg transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7B1818] text-white font-black px-10 py-5 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "CEK STATUS"}
            </button>
          </form>
          {error && (
            <div className="mt-4 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Ticket Card (Dilihat User & Dijadikan PDF) */}
        {result && (
          <div
            className={`transition-all duration-700 ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div
              ref={ticketRef}
              className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden mb-8"
            >
              <div className="bg-[#7B1818] h-4"></div>
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Official Entry Pass
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 mt-2 uppercase">
                      {result.fullName}
                    </h2>
                  </div>
                  <div className="bg-[#7B1818] text-white p-4 rounded-3xl text-center min-w-[80px]">
                    <p className="text-[9px] font-bold uppercase opacity-70 tracking-widest">
                      Cat
                    </p>
                    <p className="text-2xl font-black">{result.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-[#FDF2F2] p-6 rounded-[2rem] border border-red-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Hash size={12} /> BIB Number
                    </span>
                    <p className="text-4xl font-black text-[#7B1818] mt-2">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Shirt size={12} /> Jersey Size
                    </span>
                    <p className="text-4xl font-black text-slate-900 mt-2">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <MapPin size={18} className="text-[#7B1818]" />
                    <span className="text-sm font-bold">
                      Plaza Internatio, Surabaya
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar size={18} className="text-[#7B1818]" />
                    <span className="text-sm font-bold">
                      Minggu, 24 Mei 2026 | 06:00 WIB
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center py-6 border-t border-dashed border-slate-200">
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 mb-4">
                    {/* MENGGUNAKAN IMG UNTUK STABILITAS PDF */}
                    <img
                      id="main-qr-code"
                      src={qrDataUrl}
                      alt="Race QR"
                      className="w-[180px] h-[180px] block"
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                    Entry Pass Code
                  </p>
                  <p className="text-[9px] text-slate-300 font-mono mt-1">
                    ID: {result._id}
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 p-6 text-center">
                <p className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">
                  Surabaya Heritage Run 2026
                </p>
              </div>
            </div>

            {/* Tombol Download */}
            {result.paymentStatus === "paid" && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] text-white py-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-70"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Download className="text-[#D4AF37]" />
                )}
                <span className="font-black tracking-[0.2em]">
                  {downloading ? "MEMPROSES PDF..." : "UNDUH E-TICKET (PDF)"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatusPage;
