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
  Ticket,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Hash,
  Shirt,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// ... imports (React, QRCodeCanvas, dll tetap sama)

// --- KOMPONEN TIKET PREMIUM (KHUSUS PDF) ---
const PrintableTicket = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        background: "#ffffff",
        fontFamily: "'Times New Roman', serif", // Font Serif untuk kesan Heritage/Mahal
        position: "relative",
        color: "#000",
      }}
    >
      {/* 1. TOP ACCENT BAR */}
      <div
        style={{ height: "12px", background: "#DC2626", width: "100%" }}
      ></div>

      <div style={{ padding: "60px 50px" }}>
        {/* 2. HEADER: Minimalist Elegant */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "42px",
              letterSpacing: "4px",
              margin: "0 0 10px 0",
              textTransform: "uppercase",
              color: "#0F172A",
            }}
          >
            Surabaya Heritage Run
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#DC2626",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Official Race Entry Pass
          </p>
        </div>

        {/* 3. QR CODE: CENTERPIECE (BESAR) */}
        {/* Dibuat sangat besar dan di tengah sesuai request */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "40px",
            padding: "20px",
          }}
        >
          <div
            style={{
              border: "1px solid #e2e8f0",
              padding: "15px",
              borderRadius: "4px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)", // Soft shadow (html2canvas support)
            }}
          >
            <QRCodeCanvas
              value={data._id}
              size={280} // UKURAN BESAR
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"} // High Error Correction
              includeMargin={false}
            />
          </div>
        </div>

        {/* 4. ID PESERTA (Kecil di bawah QR) */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
            fontFamily: "monospace",
            color: "#64748B",
            fontSize: "14px",
          }}
        >
          ID TIKET: {data._id}
        </div>

        {/* 5. MAIN INFO (Nama & Kategori) */}
        <div
          style={{
            borderTop: "2px solid #000",
            borderBottom: "2px solid #000",
            padding: "30px 0",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 2 }}>
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "12px",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Nama Peserta
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: "42px",
                  textTransform: "uppercase",
                  lineHeight: "1",
                }}
              >
                {data.fullName}
              </h2>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "12px",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Kategori
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: "56px",
                  color: "#DC2626",
                  lineHeight: "1",
                }}
              >
                {data.category}
              </h2>
            </div>
          </div>
        </div>

        {/* 6. TECHNICAL DETAILS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "30px",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {/* Kolom 1: BIB & Jersey */}
          <div>
            <div style={{ marginBottom: "25px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                NOMOR BIB
              </p>
              <p
                style={{ fontSize: "28px", fontWeight: "bold", color: "#000" }}
              >
                {data.bibNumber || "-"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                UKURAN JERSEY
              </p>
              <p
                style={{ fontSize: "24px", fontWeight: "bold", color: "#000" }}
              >
                {data.jerseySize}
              </p>
            </div>
          </div>

          {/* Kolom 2: Waktu */}
          <div>
            <div style={{ marginBottom: "25px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                TANGGAL
              </p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#000" }}>
                Minggu, 24 Mei 2026
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                WAKTU START
              </p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#000" }}>
                06:00 WIB (Tepat)
              </p>
            </div>
          </div>

          {/* Kolom 3: Lokasi & Status */}
          <div>
            <div style={{ marginBottom: "25px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                LOKASI
              </p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#000" }}>
                Plaza Internatio
              </p>
              <p style={{ fontSize: "12px", color: "#64748B" }}>
                Jl. Garuda, Surabaya
              </p>
            </div>
            <div
              style={{
                border: "2px solid #16A34A",
                padding: "10px",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#16A34A",
                  letterSpacing: "2px",
                }}
              >
                LUNAS / PAID
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. BOTTOM BAR */}
      <div
        style={{
          background: "#0F172A",
          color: "white",
          padding: "20px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", opacity: 0.7 }}>
          Harap tunjukkan QR Code ini di meja registrasi ulang.
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          SURABAYAHERITAGERUN.COM
        </p>
      </div>
    </div>
  );
});

// ... Sisa kode CheckStatusPage (Logic handleDownloadPDF, dll) TETAP SAMA ...
// ... Pastikan handleDownloadPDF menggunakan scale: 2 atau 3 agar gambar tajam ...

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

  const printRef = useRef(null); // Ref untuk hidden ticket

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
      // --- UPDATE CORS & URL API ---
      // Menggunakan variabel environment agar memanggil server Koyeb saat online
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

      const res = await axios.post(`${apiUrl}/api/check-status`, {
        email,
      });

      if (res.data.success) {
        setResult(res.data.data);
        setTimeout(() => setIsTicketLoaded(true), 100);
      }
    } catch (err) {
      // Jika error 403/401 muncul di konsol, itu tandanya kebijakan CORS di backend belum mengizinkan domain Vercel
      setError("Data tidak ditemukan. Pastikan email yang dimasukkan benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", margin, 20, imgWidth, imgHeight);
      pdf.save(`SHR_Ticket_${result.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      alert("Gagal download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900 relative">
      {/* HIDDEN PRINTABLE TICKET */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        <PrintableTicket ref={printRef} data={result} />
      </div>

      {/* HEADER BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-transparent"></div>
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-20">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={16} /> Beranda
          </button>
          <span className="text-white/60 font-serif text-sm tracking-wider">
            OFFICIAL CHECKER
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
          className="bg-white p-2 rounded-2xl shadow-2xl shadow-black/20 mb-8 flex relative z-20 transform transition-all hover:scale-[1.01]"
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
            {/* CARD TIKET UTAMA */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mb-8 relative group">
              {/* Top Decor Line */}
              <div className="h-2 w-full bg-gradient-to-r from-red-600 to-red-400"></div>

              {/* HEADER TIKET */}
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
                {/* Badge Kategori */}
                <div
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shadow-inner ${result.category === "5K" ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}
                >
                  <span className="text-xs font-bold opacity-80">KAT</span>
                  <span className="text-3xl font-black leading-none">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* DASHED LINE */}
              <div className="relative h-1 my-4">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-slate-200"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-r-full -ml-3"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-l-full -mr-3"></div>
              </div>

              {/* BODY INFO GRID */}
              <div className="px-8 py-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* BIB NUMBER */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Hash size={12} /> Nomor BIB
                    </span>
                    <span className="text-3xl font-black text-red-600 font-mono tracking-tighter">
                      {result.bibNumber || "---"}
                    </span>
                  </div>

                  {/* JERSEY SIZE */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Shirt size={12} /> Jersey
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {result.jerseySize}
                    </span>
                  </div>
                </div>

                {/* EVENT DETAILS (NEW SECTION) */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase">
                          Tanggal
                        </p>
                        <p className="font-bold text-sm">Minggu, 24 Mei 2026</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase">
                          Waktu
                        </p>
                        <p className="font-bold text-sm">06:00 WIB - Selesai</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-red-400" size={20} />
                      </div>
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

                {/* STATUS BAR */}
                <div className="mb-6">
                  {result.paymentStatus === "paid" ? (
                    <div className="bg-green-50 text-green-700 py-3 px-4 rounded-xl border border-green-200 flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle size={18} /> PEMBAYARAN LUNAS
                    </div>
                  ) : (
                    <div className="bg-orange-50 text-orange-700 py-3 px-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2 font-bold text-sm animate-pulse">
                      <ShieldCheck size={18} /> MENUNGGU PEMBAYARAN
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER QR (Untuk Web View) */}
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-3">
                  <QRCodeCanvas value={result._id} size={100} />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  ID: {result._id}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {result.paymentStatus === "paid" ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                {downloading ? "Memproses PDF..." : "Simpan E-Ticket (PDF)"}
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate("/payment", { state: { userData: result } })
                }
                className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-red-700 hover:shadow-red-600/30 transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1"
              >
                Bayar Sekarang <ChevronRight />
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
