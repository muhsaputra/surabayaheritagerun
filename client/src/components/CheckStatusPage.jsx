import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import {
  Search,
  CheckCircle,
  ArrowLeft,
  Download,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  ShieldCheck,
  Hash,
  Shirt,
  ChevronRight,
  Trophy,
  History,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// --- KOMPONEN TIKET PROFESIONAL (PRINTABLE) ---
const PrintableTicket = React.forwardRef(({ data, qrUrl }, ref) => {
  if (!data) return null;

  const HERITAGE_MAROON = "#7B1818";
  const HERITAGE_GOLD = "#D4AF37";
  const DEEP_SLATE = "#0F172A";

  return (
    <div
      ref={ref}
      style={{
        width: "794px", // Standar A4
        padding: "0",
        background: "#FDFBF7",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        color: DEEP_SLATE,
      }}
    >
      {/* Decorative Border */}
      <div
        style={{ height: "20px", background: HERITAGE_MAROON, width: "100%" }}
      ></div>

      <div style={{ padding: "60px" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "900",
              margin: "0",
              color: HERITAGE_MAROON,
              letterSpacing: "-1px",
              textTransform: "uppercase",
            }}
          >
            SURABAYA{" "}
            <span style={{ fontWeight: "300", color: DEEP_SLATE }}>
              HERITAGE
            </span>{" "}
            RUN
          </h1>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "5px",
              color: HERITAGE_GOLD,
              marginTop: "10px",
              textTransform: "uppercase",
            }}
          >
            Official Runner Entry Pass • 2026
          </p>
        </div>

        {/* Main Badge */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "10px 30px",
              borderRadius: "50px",
              background: "#10B981",
              color: "white",
              fontSize: "14px",
              fontWeight: "900",
              boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
            }}
          >
            CONFIRMED PARTICIPANT
          </div>
        </div>

        {/* Info Grid Card */}
        <div
          style={{
            background: "white",
            borderRadius: "30px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          {/* Top Row: Category & BIB */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px dashed #E2E8F0",
              padding: "40px",
            }}
          >
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "900",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                }}
              >
                Runner Name
              </span>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  margin: "5px 0 0",
                }}
              >
                {data.fullName}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "900",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                }}
              >
                Race BIB
              </span>
              <p
                style={{
                  fontSize: "48px",
                  fontWeight: "900",
                  margin: "0",
                  color: HERITAGE_MAROON,
                }}
              >
                #{data.bibNumber || "---"}
              </p>
            </div>
          </div>

          {/* Details Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "40px",
              gap: "30px",
            }}
          >
            {[
              {
                label: "Category",
                val: `${data.category} RUN`,
                color: HERITAGE_MAROON,
              },
              { label: "Jersey Size", val: data.jerseySize, color: DEEP_SLATE },
              { label: "Flag Off", val: "06:00 WIB", color: DEEP_SLATE },
              { label: "Date", val: "24 Mei 2026", color: DEEP_SLATE },
              { label: "Venue", val: "Plaza Internatio", color: DEEP_SLATE },
              { label: "Status", val: "PAID / LUNAS", color: "#10B981" },
            ].map((item, idx) => (
              <div key={idx}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "900",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </span>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    margin: "5px 0 0",
                    color: item.color,
                  }}
                >
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {/* QR Section */}
          <div
            style={{
              background: "#F8FAFC",
              padding: "50px",
              textAlign: "center",
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "20px",
                background: "white",
                borderRadius: "25px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                border: `2px solid ${HERITAGE_MAROON}`,
              }}
            >
              {/* PENTING: Gunakan tag IMG untuk PDF agar terbaca di Android */}
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Race QR"
                  style={{ width: "200px", height: "200px", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    background: "#eee",
                  }}
                ></div>
              )}
            </div>
            <p
              style={{
                marginTop: "20px",
                fontSize: "11px",
                fontWeight: "900",
                color: DEEP_SLATE,
                letterSpacing: "2px",
              }}
            >
              SCAN FOR RACE PACK COLLECTION
            </p>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          width: "100%",
          padding: "30px 0",
          background: DEEP_SLATE,
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: "10px",
            margin: "0",
            letterSpacing: "3px",
          }}
        >
          WWW.SURABAYAHERITAGERUN.COM
        </p>
      </div>
    </div>
  );
});

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
  const printRef = useRef(null);

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
    if (!printRef.current || !result) return;
    setDownloading(true);

    try {
      // Tunggu render Base64 selesai (Sangat penting untuk HP)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const canvas = await html2canvas(printRef.current, {
        scale: 3, // Kualitas Tinggi
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
      pdf.save(`Ticket_SHR_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Capture Error:", err);
      alert("Gagal mengunduh tiket. Coba gunakan browser Google Chrome.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 overflow-x-hidden">
      {/* Hidden Printable Ticket */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        <PrintableTicket ref={printRef} data={result} qrUrl={qrDataUrl} />
      </div>

      {/* Hero Header */}
      <div className="relative h-[45vh] bg-[#7B1818] overflow-hidden flex items-center justify-center rounded-b-[4rem] shadow-2xl">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/dark-wood.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>

        <div className="relative z-10 text-center px-4">
          <button
            onClick={() => navigate("/")}
            className="mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-xl">
            Status <span className="text-[#D4AF37]">Pendaftaran</span>
          </h1>
          <p className="mt-4 text-white/80 font-medium max-w-lg mx-auto">
            Amankan bukti heroisme Anda. Masukkan email untuk mendapatkan
            E-Ticket resmi.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20 pb-24">
        {/* Search Card */}
        <div className="bg-white p-4 md:p-6 rounded-[3rem] shadow-2xl border border-slate-100 mb-10">
          <form
            onSubmit={handleCheck}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                size={24}
              />
              <input
                type="email"
                placeholder="Alamat email saat mendaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-16 pr-6 py-6 rounded-full bg-slate-50 border-none focus:ring-4 focus:ring-[#7B1818]/10 text-lg transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7B1818] hover:bg-[#5a1212] text-white font-black px-12 py-6 rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#7B1818]/30 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <History size={24} />
              )}
              CEK STATUS
            </button>
          </form>
          {error && (
            <div className="mt-4 px-6 py-4 bg-red-50 text-red-600 rounded-3xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle size={20} /> {error}
            </div>
          )}
        </div>

        {/* Ticket Preview */}
        {result && (
          <div
            className={`transition-all duration-700 transform ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-8">
              {/* Visual Accent */}
              <div className="bg-gradient-to-r from-[#7B1818] to-[#0F172A] h-4"></div>

              <div className="p-8 md:p-12">
                {/* Header Ticket */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Official Entry Pass
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 mt-2 uppercase">
                      {result.fullName}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Race Category
                      </p>
                      <p className="text-2xl font-black text-[#7B1818] leading-none">
                        {result.category} RUN
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-[#7B1818] rounded-2xl flex items-center justify-center text-white">
                      <Trophy size={24} />
                    </div>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-[#7B1818] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#7B1818]/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                      <Hash size={100} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                      Your BIB
                    </span>
                    <p className="text-5xl font-black mt-2 font-serif tracking-tighter">
                      #{result.bibNumber || "---"}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                      <Shirt size={100} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                      Jersey Size
                    </span>
                    <p className="text-5xl font-black mt-2 uppercase tracking-tighter">
                      {result.jerseySize}
                    </p>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {[
                    {
                      icon: <Calendar size={20} />,
                      label: "Tanggal",
                      val: "24 Mei 2026",
                    },
                    {
                      icon: <MapPin size={20} />,
                      label: "Lokasi",
                      val: "Plaza Internatio",
                    },
                    {
                      icon: <Clock size={20} />,
                      label: "Flag Off",
                      val: "06:00 WIB",
                    },
                    {
                      icon: <ShieldCheck size={20} />,
                      label: "Status",
                      val: "LUNAS / PAID",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="text-[#7B1818]">{item.icon}</div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {item.val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini QR Web View */}
                <div className="flex flex-col items-center py-6 border-t border-dashed border-slate-200">
                  <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100 mb-4 transform hover:scale-105 transition-transform">
                    <QRCodeCanvas
                      value={result._id}
                      size={150}
                      level="H"
                      fgColor="#0F172A"
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                    Entry Pass Code
                  </p>
                </div>
              </div>
            </div>

            {/* Download Action */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-8 rounded-[3rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-70 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Download className="text-[#D4AF37] group-hover:animate-bounce" />
                )}
                <span className="font-black tracking-[0.3em] uppercase">
                  {downloading
                    ? "GENERATING TICKET..."
                    : "UNDUH E-TICKET (PDF)"}
                </span>
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate("/payment", { state: { userData: result } })
                }
                className="w-full bg-[#7B1818] hover:bg-[#5a1212] text-white py-8 rounded-[3rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:-translate-y-2"
              >
                SELESAIKAN PEMBAYARAN <ChevronRight />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
