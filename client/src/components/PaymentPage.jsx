import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  UploadCloud,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  QrCode,
} from "lucide-react";

// --- PAYMENT METHOD ICONS (Grayscale to Color on Hover) ---
const PaymentMethodIcons = () => (
  <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mt-4">
    {["BCA", "Gopay", "OVO", "Shopee"].map((bank) => (
      <div
        key={bank}
        className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200"
      >
        {bank}
      </div>
    ))}
  </div>
);

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!state?.userData) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.userData) return null;
  const { userData } = state;

  // Placeholder QRIS (Ganti dengan URL QRIS Asli Anda)
  const QRIS_IMAGE_URL =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const processFile = (file) => {
    setErrorMsg("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap upload file gambar (JPG/PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file terlalu besar (Maksimal 5MB).");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("paymentProof", selectedFile);
    formData.append("id", userData._id);

    try {
      const response = await fetch("http://localhost:5001/api/payment/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal upload gambar");
      if (result.success) {
        setUploadSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Upload Failed:", error);
      setErrorMsg(
        error.message || "Gagal mengupload bukti pembayaran. Coba lagi.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* HEADER BACKGROUND (BLACK & RED) */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-slate-900 rounded-b-[3rem] z-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-600 opacity-20 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* NAVIGASI & JUDUL */}
        <div className="text-center mb-8 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute top-0 left-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-serif font-bold text-white mb-1 drop-shadow-md">
            Konfirmasi Pembayaran
          </h2>
          <p className="text-slate-300 text-sm font-medium">
            Langkah terakhir untuk mengamankan slot Anda.
          </p>
        </div>

        {/* CARD UTAMA */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden relative">
          {/* DEKORASI ATAS (RED STRIPE) */}
          <div className="h-2 w-full bg-red-600"></div>

          <div className="p-8">
            {uploadSuccess ? (
              // --- TAMPILAN SUKSES ---
              <div className="py-10 flex flex-col items-center text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-green-100">
                  <CheckCircle
                    className="text-green-600 w-12 h-12"
                    strokeWidth={3}
                  />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Pembayaran Terkirim!
                </h3>
                <p className="text-slate-500 text-sm px-4 mb-8 leading-relaxed">
                  Terima kasih, <b>{userData.fullName}</b>. <br />
                  Bukti transfer Anda sedang diverifikasi. E-Ticket akan dikirim
                  otomatis ke email Anda setelah lunas.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center gap-2 group"
                >
                  Kembali ke Beranda
                  <ArrowLeft
                    size={18}
                    className="rotate-180 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            ) : (
              // --- TAMPILAN FORM UPLOAD ---
              <>
                <div className="text-center mb-8">
                  {/* QRIS Container */}
                  <div className="inline-block p-4 bg-white border-2 border-slate-100 rounded-3xl mb-6 relative group shadow-sm hover:border-red-100 transition-colors">
                    <img
                      src={QRIS_IMAGE_URL}
                      alt="QRIS Code"
                      className="w-48 h-48 object-contain mix-blend-multiply relative z-10"
                    />
                    {/* Scan Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_#EF4444] animate-scan z-20 pointer-events-none opacity-80 rounded-full"></div>
                    <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-slate-400">
                      <QrCode size={14} /> Scan QRIS
                    </div>
                  </div>

                  {/* Nominal */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Total Tagihan
                    </p>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                      Rp {userData.pricePaid?.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <PaymentMethodIcons />
                </div>

                <div className="space-y-5">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-shake">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Upload Area */}
                  {!selectedFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                        isDragOver
                          ? "border-red-500 bg-red-50/50 scale-[1.02]"
                          : "border-slate-200 hover:border-red-400 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="flex flex-col items-center gap-3 relative z-10 pointer-events-none">
                        <div
                          className={`p-4 rounded-full bg-slate-50 text-slate-400 group-hover:text-red-600 group-hover:bg-white group-hover:shadow-md transition-all duration-300 ${isDragOver ? "text-red-600 bg-white shadow-md" : ""}`}
                        >
                          <UploadCloud size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                            Klik atau Tarik Bukti Transfer
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Format: JPG, PNG (Maks. 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Preview Image
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-lg animate-fade-in">
                      <img
                        src={previewUrl}
                        alt="Preview Bukti Bayar"
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all z-20"
                        title="Hapus gambar"
                      >
                        <XCircle size={20} />
                      </button>

                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-medium truncate">
                          {selectedFile.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex justify-center items-center gap-3 transition-all transform active:scale-95 ${
                      !selectedFile || uploading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30 hover:-translate-y-1"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Smartphone size={24} />
                        Konfirmasi Pembayaran
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
                    <ShieldCheck size={12} className="text-green-600" />
                    Transaksi Aman & Terenkripsi
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER DETAIL PESERTA */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <Receipt size={12} /> Rincian Tagihan
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <User size={14} />{" "}
                  <span className="text-xs font-bold uppercase">Nama</span>
                </div>
                <span className="font-bold text-slate-900">
                  {userData.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail size={14} />{" "}
                  <span className="text-xs font-bold uppercase">Email</span>
                </div>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">
                  {userData.email}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard size={14} />{" "}
                  <span className="text-xs font-bold uppercase">
                    ID Transaksi
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {userData._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes scan { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 2s linear infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default PaymentPage;
