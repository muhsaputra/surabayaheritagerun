import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode"; // Wajib: npm install qrcode
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

// --- KOMPONEN TIKET PREMIUM (PRINTABLE) ---
// Komponen ini disembunyikan dari layar tapi di-render secara aktif untuk snapshot PDF
const PrintableTicket = React.forwardRef(({ data, qrUrl }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "794px", // Lebar standar A4 (96 DPI)
        background: "#ffffff",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        color: "#0F172A",
        paddingBottom: "40px",
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
          <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0" }}>
            Halo, {data.fullName}!
          </h2>
          <div
            style={{
              display: "inline-block",
              background: "#FDF2F2",
              color: "#9B1B1B",
              padding: "8px 20px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: "900",
              marginTop: "12px",
              textTransform: "uppercase",
              border: "1px solid #F87171",
            }}
          >
            STATUS: TERVERIFIKASI LUNAS
          </div>
        </div>

        {/* 4. TICKET BOX */}
        <div
          style={{
            border: "2px solid #E2E8F0",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#F9FAFB",
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
                }}
              >
                KATEGORI
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

          <div
            style={{
              padding: "35px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
            }}
          >
            {[
              { label: "Hari & Tanggal", val: "Minggu, 24 Mei 2026" },
              { label: "Waktu Flag Off", val: "06.00 WIB" },
              { label: "Tempat (Venue)", val: "Plaza Internatio" },
              { label: "Ukuran Jersey", val: data.jerseySize },
            ].map((item, i) => (
              <div key={i}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#94A3B8",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    margin: "0",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: "17px", fontWeight: "800", margin: "0" }}>
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {/* QR CODE - DITERIMA SEBAGAI IMG TAG AGAR STABIL DI HP */}
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
                border: "4px solid #9B1B1B",
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
                color: "#9B1B1B",
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
                marginTop: "10px",
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
        <p
          style={{
            margin: "0",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#D4AF37",
            letterSpacing: "2px",
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

  // Fungsi helper untuk menjamin gambar telah termuat sebelum snapshot
  const waitForImage = (imgElement) => {
    return new Promise((resolve) => {
      if (imgElement.complete && imgElement.naturalHeight !== 0) {
        resolve();
      } else {
        imgElement.onload = () => resolve();
        imgElement.onerror = () => resolve();
      }
    });
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Harap masukkan email.");
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
        // SOLUSI ANDROID: Konversi ke Base64 segera
        const qrUrl = await QRCode.toDataURL(res.data.data._id, {
          width: 600,
          margin: 1,
          color: { dark: "#9B1B1B", light: "#FFFFFF" },
        });
        setQrDataUrl(qrUrl);
        setTimeout(() => setIsTicketLoaded(true), 200);
      }
    } catch (err) {
      setError("Data tidak ditemukan. Pastikan email Anda benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !result || !qrDataUrl) return;
    setDownloading(true);

    try {
      // 1. Dapatkan elemen gambar di dalam komponen tersembunyi
      const qrImgInsidePrint = printRef.current.querySelector(
        'img[alt="Ticket QR"]',
      );

      // 2. TUNGGU gambar benar-benar ter-load (Mencegah QR kosong di PDF)
      if (qrImgInsidePrint) {
        await waitForImage(qrImgInsidePrint);
      }

      // 3. Jeda sinkronisasi render (Sangat penting untuk mobile browser)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(printRef.current, {
        scale: 3, // Kualitas tinggi agar QR mudah di-scan
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Memastikan gambar terlihat pada dokumen clone html2canvas
          const qr = clonedDoc.querySelector('img[alt="Ticket QR"]');
          if (qr) qr.style.visibility = "visible";
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Ticket_SHR2026_${result.bibNumber || "Registration"}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 relative overflow-x-hidden">
      {/* LOGIKA FIX: Komponen PDF diletakkan di luar layar (Off-screen) 
        Jangan gunakan display: none karena Android sering mematikan render gambar pada elemen tersembunyi.
      */}
      <div
        style={{
          position: "absolute",
          top: "-10000px",
          left: "0",
          opacity: "1",
          zIndex: "-100",
          pointerEvents: "none",
        }}
      >
        <PrintableTicket ref={printRef} data={result} qrUrl={qrDataUrl} />
      </div>

      {/* HEADER VISUAL */}
      <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#450a0a] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-20">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-red-400 flex items-center gap-2 font-bold transition-all bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <Trophy className="text-[#D4AF37]" size={28} />
        </div>

        <div className="text-center mb-10 text-white">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 tracking-tight">
            Status Peserta
          </h1>
          <p className="text-slate-300 font-light italic">
            "Surabaya Heritage Run 2026"
          </p>
        </div>

        {/* SEARCH FORM */}
        <form
          onSubmit={handleCheck}
          className="bg-white p-2.5 rounded-[2rem] shadow-2xl mb-12 flex relative z-20 transition-all border border-slate-100"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
              size={24}
            />
            <input
              type="email"
              placeholder="Masukkan email pendaftaran..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-16 pr-4 py-5 rounded-2xl outline-none font-medium text-slate-900 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#9B1B1B] hover:bg-[#7a1515] text-white font-black px-10 rounded-2xl transition-all disabled:opacity-70 flex items-center gap-3 shadow-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "CARI TIKET"
            )}
          </button>
        </form>

        {result && (
          <div
            className={`transition-all duration-1000 ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 mb-10 relative">
              <div className="h-4 w-full bg-gradient-to-r from-[#9B1B1B] to-[#1B4D3E]"></div>

              <div className="px-10 pt-10 pb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase leading-tight mb-2">
                    {result.fullName}
                  </h2>
                  <p className="text-slate-400 font-bold tracking-widest">
                    {result.email}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl text-white ${result.category === "5K" ? "bg-slate-900 shadow-xl shadow-slate-200" : "bg-[#9B1B1B] shadow-xl shadow-red-100"}`}
                >
                  <span className="text-[10px] font-black opacity-70 uppercase tracking-tighter">
                    Category
                  </span>
                  <span className="text-4xl font-black">{result.category}</span>
                </div>
              </div>

              <div className="px-10 pb-10">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#FDFBF7] p-8 rounded-[2rem] border border-red-50 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
                      <Hash size={14} /> BIB Number
                    </span>
                    <span className="text-5xl font-black text-[#9B1B1B] font-serif tracking-tighter">
                      {result.bibNumber || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
                      <Shirt size={14} /> Jersey
                    </span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {result.jerseySize}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1B4D3E] p-4 rounded-2xl text-center mb-8 flex items-center justify-center gap-3">
                  <ShieldCheck className="text-[#D4AF37]" size={20} />
                  <span className="text-white font-black text-xs tracking-widest uppercase">
                    E-Ticket Terverifikasi Lunas
                  </span>
                </div>

                <div className="bg-[#F9FAFB] p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center">
                  <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-slate-100 mb-6 transform transition-transform hover:scale-105">
                    <QRCodeCanvas
                      value={result._id}
                      size={150}
                      level="H"
                      fgColor="#9B1B1B"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-serif italic font-bold uppercase tracking-[0.3em]">
                    Official Heritage Runner Pass
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full bg-[#0F172A] text-white font-black py-7 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all flex justify-center items-center gap-4 transform hover:-translate-y-2 active:scale-95 disabled:opacity-70 group"
            >
              {downloading ? (
                <Loader2 className="animate-spin text-[#D4AF37]" />
              ) : (
                <Download className="group-hover:animate-bounce text-[#D4AF37]" />
              )}
              <span className="tracking-[0.2em] text-sm uppercase">
                {downloading ? "MEMPROSES PDF..." : "DOWNLOAD E-TICKET (PDF)"}
              </span>
            </button>
          </div>
        )}
      </div>

      <style>{`
         .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CheckStatusPage;
