import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode"; // Library qrcode (pastikan sudah instal: npm install qrcode)
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
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// --- KOMPONEN TIKET PREMIUM (KHUSUS UNTUK GENERATE PDF) ---
const PrintableTicket = React.forwardRef(({ data, qrUrl }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "794px", // Ukuran A4 standar (pixel 96dpi)
        background: "#ffffff",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        color: "#0F172A",
      }}
    >
      {/* 1. TOP ACCENT BAR */}
      <div
        style={{ height: "15px", background: "#9B1B1B", width: "100%" }}
      ></div>

      <div style={{ padding: "50px" }}>
        {/* 2. HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "38px",
              fontWeight: "900",
              margin: "0",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#1B4D3E",
            }}
          >
            SURABAYA <span style={{ color: "#9B1B1B" }}>HERITAGE</span> RUN
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#64748B",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginTop: "5px",
              fontWeight: "bold",
            }}
          >
            Official Race Entry Pass 2026
          </p>
        </div>

        {/* 3. WELCOME MESSAGE */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "800",
              margin: "0",
              color: "#0F172A",
            }}
          >
            Halo, {data.fullName}!
          </h2>
          <div
            style={{
              display: "inline-block",
              background: "#F0FDF4",
              color: "#16A34A",
              padding: "8px 20px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: "900",
              marginTop: "12px",
              textTransform: "uppercase",
              border: "1px solid #BBF7D0",
            }}
          >
            Status: TERVERIFIKASI LUNAS
          </div>
        </div>

        {/* 4. TICKET BOX */}
        <div
          style={{
            border: "2px solid #E2E8F0",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
          }}
        >
          {/* Box Header */}
          <div
            style={{
              background: "#F8FAFC",
              padding: "25px",
              borderBottom: "2px dashed #CBD5E1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#64748B",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  margin: "0",
                  letterSpacing: "1px",
                }}
              >
                KATEGORI LARI
              </p>
              <p
                style={{
                  fontSize: "26px",
                  color: "#9B1B1B",
                  fontWeight: "900",
                  margin: "0",
                }}
              >
                {data.category} RUN
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "10px",
                  color: "#64748B",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  margin: "0",
                  letterSpacing: "1px",
                }}
              >
                NOMOR BIB
              </p>
              <p
                style={{
                  fontSize: "36px",
                  color: "#1B4D3E",
                  fontWeight: "900",
                  margin: "0",
                }}
              >
                #{data.bibNumber || "---"}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div
            style={{
              padding: "35px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
              background: "#ffffff",
            }}
          >
            {[
              { label: "Hari & Tanggal", val: "Minggu, 24 Mei 2026" },
              { label: "Waktu Flag Off", val: "06.00 WIB" },
              { label: "Tempat (Venue)", val: "Plaza Internatio" },
              { label: "Lokasi", val: "Jl. Garuda, Surabaya" },
              { label: "Ukuran Jersey", val: data.jerseySize },
              { label: "Status Tiket", val: "PAID / VALID", color: "#16A34A" },
            ].map((item, i) => (
              <div key={i}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#94A3B8",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    margin: "0 0 5px 0",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "17px",
                    fontWeight: "800",
                    margin: "0",
                    color: item.color || "#0F172A",
                  }}
                >
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {/* QR Code Section - GUNAKAN IMG TAG UNTUK STABILITAS DI ANDROID */}
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              background: "#F9FAFB",
              borderTop: "2px dashed #CBD5E1",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "18px",
                border: "4px solid #1B4D3E",
                borderRadius: "24px",
                background: "#ffffff",
              }}
            >
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Ticket QR"
                  style={{ width: "220px", height: "220px", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "220px",
                    height: "220px",
                    background: "#f3f4f6",
                  }}
                ></div>
              )}
            </div>
            <p
              style={{
                marginTop: "20px",
                fontWeight: "900",
                color: "#1B4D3E",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              SCAN SAAT PENGAMBILAN RACE PACK
            </p>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "10px",
                fontFamily: "monospace",
                marginTop: "8px",
              }}
            >
              ID: {data._id}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#0F172A",
          padding: "30px",
          textAlign: "center",
          color: "#94A3B8",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "500" }}>
          Tunjukkan e-ticket ini & KTP asli saat Race Pack Collection.
        </p>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#D4AF37",
            letterSpacing: "2px",
          }}
        >
          OFFICIAL TICKET SURABAYA HERITAGE RUN 2026
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
      setError("Harap masukkan email.");
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
        // Generate QR Data URL segera setelah data didapat (Solusi Android)
        const qrUrl = await QRCode.toDataURL(res.data.data._id, {
          width: 600,
          margin: 1,
          color: { dark: "#1B4D3E", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);
        setTimeout(() => setIsTicketLoaded(true), 200);
      }
    } catch (err) {
      setError("Data tidak ditemukan. Pastikan email terdaftar benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !result) return;
    setDownloading(true);

    try {
      // Tunggu render internal selesai (Buffer untuk Android)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(printRef.current, {
        scale: 3, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Posisikan tiket di tengah halaman A4
      const yPos = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", 0, yPos > 0 ? yPos : 0, pdfWidth, imgHeight);
      pdf.save(`Ticket_SHR_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      {/* HIDDEN PRINTABLE COMPONENT (Solusi PDF) */}
      <div style={{ position: "absolute", top: "-20000px", left: "-20000px" }}>
        <PrintableTicket ref={printRef} data={result} qrUrl={qrDataUrl} />
      </div>

      {/* HEADER VISUAL */}
      <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-transparent"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-20">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold transition-all bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md"
          >
            <ArrowLeft size={16} /> Beranda
          </button>
          <div className="flex items-center gap-2 text-red-400">
            <Trophy size={16} />
            <span className="text-white/60 font-serif text-sm tracking-widest uppercase italic">
              Heritage Checker
            </span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
            Status Peserta
          </h1>
          <p className="text-slate-300 font-light">
            Masukkan email terdaftar untuk akses e-ticket Anda.
          </p>
        </div>

        {/* SEARCH BOX */}
        <form
          onSubmit={handleCheck}
          className="bg-white p-2.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-8 flex relative z-20 transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
              size={22}
            />
            <input
              type="email"
              placeholder="alamat@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-16 pr-4 py-5 rounded-2xl outline-none font-medium text-slate-900 placeholder:text-slate-400 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#9B1B1B] hover:bg-[#7a1515] text-white font-bold px-10 rounded-2xl transition-all disabled:opacity-70 flex items-center gap-3 shadow-lg shadow-red-900/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Cari Tiket"
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-r-2xl flex items-center gap-4 shadow-sm animate-fade-in-up">
            <AlertCircle size={24} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* WEB VIEW TICKET */}
        {result && (
          <div
            className={`transition-all duration-1000 ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 mb-8 relative">
              <div className="h-3 w-full bg-gradient-to-r from-[#9B1B1B] to-[#1B4D3E]"></div>

              <div className="px-10 pt-10 pb-4 flex justify-between items-start">
                <div>
                  <span className="inline-block px-4 py-1.5 bg-[#FDFBF7] text-[#9B1B1B] text-[10px] font-black tracking-widest uppercase rounded-full border border-red-100 mb-4">
                    Official Entry Pass 2026
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase leading-tight mb-1">
                    {result.fullName}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    {result.email}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl shadow-xl border-4 border-white ${result.category === "5K" ? "bg-slate-900" : "bg-[#9B1B1B]"} text-white`}
                >
                  <span className="text-[10px] font-bold opacity-70 uppercase">
                    Category
                  </span>
                  <span className="text-4xl font-black leading-none mt-1">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* SEPARATOR */}
              <div className="relative h-1 my-6 px-4">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-slate-200"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-r-full -ml-4 border border-slate-200 border-l-0"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-l-full -mr-4 border border-slate-200 border-r-0"></div>
              </div>

              <div className="px-10 py-4">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-red-50 flex flex-col items-center text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                      <Hash size={12} className="text-[#9B1B1B]" /> Nomor BIB
                    </span>
                    <span className="text-4xl font-black text-[#9B1B1B] font-serif">
                      {result.bibNumber || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                      <Shirt size={12} className="text-[#1B4D3E]" /> Jersey
                    </span>
                    <span className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                      {result.jerseySize}
                    </span>
                  </div>
                </div>

                {/* INFO EVENT */}
                <div className="bg-[#1B4D3E] rounded-[2rem] p-8 text-white shadow-2xl mb-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <Calendar className="text-[#D4AF37]" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/50 uppercase">
                          Tanggal
                        </p>
                        <p className="font-bold text-sm">24 Mei 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <MapPin className="text-[#D4AF37]" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/50 uppercase">
                          Lokasi
                        </p>
                        <p className="font-bold text-sm">Plaza Internatio</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  {result.paymentStatus === "paid" ? (
                    <div className="bg-emerald-50 text-emerald-700 py-4 px-6 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-sm">
                      <CheckCircle size={20} /> Payment Verified
                    </div>
                  ) : (
                    <div className="bg-orange-50 text-orange-700 py-4 px-6 rounded-2xl border border-orange-100 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest animate-pulse">
                      <ShieldCheck size={20} /> Waiting For Payment
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#F9FAFB] p-8 border-t border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-3xl shadow-xl border-2 border-slate-100 mb-4 transform hover:scale-105 transition-transform">
                  <QRCodeCanvas value={result._id} size={140} level="H" />
                </div>
                <p className="text-[10px] text-slate-400 font-serif italic font-bold uppercase tracking-[0.3em]">
                  Scanned for Entry Pass
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-[#0F172A] text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-black transition-all flex justify-center items-center gap-4 transform hover:-translate-y-2 disabled:opacity-70 active:scale-95 group"
              >
                {downloading ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Download className="group-hover:animate-bounce" />
                )}
                <span className="tracking-[0.2em]">
                  {downloading ? "GENERATING PDF..." : "DOWNLOAD E-TICKET"}
                </span>
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate("/payment", { state: { userData: result } })
                }
                className="w-full bg-[#9B1B1B] text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-[#7a1515] transition-all flex justify-center items-center gap-4 transform hover:-translate-y-2"
              >
                COMPLETE PAYMENT <ChevronRight size={20} />
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
