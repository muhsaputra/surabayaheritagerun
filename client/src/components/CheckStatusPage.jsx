import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// --- KOMPONEN TIKET PREMIUM (KHUSUS UNTUK GENERATE PDF) ---
const PrintableTicket = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        background: "#ffffff",
        fontFamily: "Helvetica, Arial, sans-serif",
        position: "relative",
        color: "#0F172A",
      }}
    >
      {/* 1. TOP ACCENT BAR */}
      <div
        style={{ height: "15px", background: "#DC2626", width: "100%" }}
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
            }}
          >
            SURABAYA <span style={{ color: "#DC2626" }}>HERITAGE</span> RUN
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#64748B",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginTop: "5px",
            }}
          >
            Official Race Entry Pass 2026
          </p>
        </div>

        {/* 3. WELCOME MESSAGE */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0" }}>
            Halo, {data.fullName}!
          </h2>
          <div
            style={{
              display: "inline-block",
              background: "#DCFCE7",
              color: "#16A34A",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
              marginTop: "10px",
              textTransform: "uppercase",
            }}
          >
            Pembayaran Telah Diverifikasi / Lunas
          </div>
        </div>

        {/* 4. TICKET BOX (GRID STYLE) */}
        <div
          style={{
            border: "2px solid #E2E8F0",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Box Header */}
          <div
            style={{
              background: "#F8FAFC",
              padding: "20px",
              borderBottom: "1px dashed #CBD5E1",
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
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0",
                }}
              >
                Kategori
              </p>
              <p
                style={{
                  fontSize: "22px",
                  color: "#DC2626",
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
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0",
                }}
              >
                Nomor BIB
              </p>
              <p
                style={{
                  fontSize: "28px",
                  color: "#0F172A",
                  fontWeight: "900",
                  margin: "0",
                }}
              >
                #{data.bibNumber || "---"}
              </p>
            </div>
          </div>

          {/* Box Body (Info Grid) */}
          <div
            style={{
              padding: "30px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "25px",
              borderBottom: "1px dashed #CBD5E1",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Hari & Tanggal
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
                Minggu, 24 Mei 2026
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Flag Off
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
                06.00 WIB
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Tempat (Venue)
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
                Plaza Internatio
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Start / Finish
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
                Jl. Garuda, Surabaya
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Ukuran Jersey
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
                {data.jerseySize}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Status Tiket
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#16A34A",
                  margin: "0",
                }}
              >
                PAID / VALID
              </p>
            </div>
          </div>

          {/* QR Code Section (Centered) */}
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "15px",
                border: "3px solid #0F172A",
                borderRadius: "20px",
                background: "#ffffff",
              }}
            >
              <QRCodeCanvas value={data._id} size={220} level="H" />
            </div>
            <p
              style={{
                marginTop: "20px",
                fontWeight: "900",
                color: "#0F172A",
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              SCAN SAAT PENGAMBILAN RACE PACK
            </p>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "11px",
                fontFamily: "monospace",
                marginTop: "5px",
              }}
            >
              ID: {data._id}
            </p>
          </div>
        </div>
      </div>

      {/* 5. FOOTER */}
      <div
        style={{
          background: "#0F172A",
          padding: "25px",
          textAlign: "center",
          color: "#94A3B8",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px" }}>
          Harap membawa kartu identitas (KTP) asli saat registrasi ulang.
        </p>
        <p
          style={{
            margin: "5px 0 0 0",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "1px",
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
        setTimeout(() => setIsTicketLoaded(true), 150);
      }
    } catch (err) {
      setError("Data tidak ditemukan. Pastikan email yang dimasukkan benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !result) return;
    setDownloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Tiket_SHR_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      {/* HIDDEN PRINTABLE COMPONENT */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        <PrintableTicket ref={printRef} data={result} />
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
            className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={16} /> Beranda
          </button>
          <span className="text-white/60 font-serif text-sm tracking-widest uppercase">
            Official Checker
          </span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            Status Peserta
          </h1>
          <p className="text-slate-300">
            Masukkan email terdaftar untuk melihat e-ticket Anda.
          </p>
        </div>

        {/* SEARCH BOX */}
        <form
          onSubmit={handleCheck}
          className="bg-white p-2 rounded-2xl shadow-2xl mb-8 flex relative z-20 transform transition-all hover:scale-[1.01]"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="email"
              placeholder="alamat@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-4 py-4 rounded-xl outline-none font-medium text-slate-900 placeholder:text-slate-400 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-red-600/30"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Cari Tiket"
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-center gap-3 shadow-sm animate-fade-in-up">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* HASIL TIKET (WEB VIEW) */}
        {result && (
          <div
            className={`transition-all duration-700 ${isTicketLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mb-8 relative">
              <div className="h-2 w-full bg-gradient-to-r from-red-600 to-red-400"></div>

              <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                <div>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3">
                    Official Race Pass
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase leading-none">
                    {result.fullName}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{result.email}</p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shadow-inner ${result.category === "5K" ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}
                >
                  <span className="text-xs font-bold opacity-80">KAT</span>
                  <span className="text-3xl font-black leading-none">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* DASHED LINE SEPARATOR */}
              <div className="relative h-1 my-4">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-slate-200"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-r-full -ml-3"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-l-full -mr-3"></div>
              </div>

              <div className="px-8 py-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Hash size={12} /> Nomor BIB
                    </span>
                    <span className="text-3xl font-black text-red-600 font-mono">
                      {result.bibNumber || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Shirt size={12} /> Jersey
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {result.jerseySize}
                    </span>
                  </div>
                </div>

                {/* INFO EVENT */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                      <Calendar className="text-red-400" size={20} />
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase">
                          Tanggal
                        </p>
                        <p className="font-bold text-sm">Minggu, 24 Mei 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Clock className="text-red-400" size={20} />
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase">
                          Waktu Flag Off
                        </p>
                        <p className="font-bold text-sm">06:00 WIB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPin className="text-red-400" size={20} />
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase">
                          Lokasi
                        </p>
                        <p className="font-bold text-sm">
                          Plaza Internatio, Surabaya
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  {result.paymentStatus === "paid" ? (
                    <div className="bg-green-50 text-green-700 py-3 px-4 rounded-xl border border-green-200 flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle size={18} /> PEMBAYARAN TERKONFIRMASI
                    </div>
                  ) : (
                    <div className="bg-orange-50 text-orange-700 py-3 px-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2 font-bold text-sm animate-pulse">
                      <ShieldCheck size={18} /> MENUNGGU PEMBAYARAN
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-3">
                  <QRCodeCanvas value={result._id} size={110} level="H" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                  Scan for Check-in
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1 disabled:opacity-70"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                {downloading ? "Memproses PDF..." : "Download E-Ticket (PDF)"}
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate("/payment", { state: { userData: result } })
                }
                className="w-full bg-red-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-red-700 transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1"
              >
                Lanjutkan ke Pembayaran <ChevronRight size={20} />
              </button>
            )}
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
