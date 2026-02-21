import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  X,
  User,
  BadgeCheck,
  CheckCircle,
  ImageIcon,
  Tag,
  Wallet,
  Phone,
  MapPin,
  Mail,
  ShieldAlert,
  CalendarDays,
  Shirt,
  Fingerprint,
  Maximize2,
  AlertCircle,
  Clock,
  Medal,
} from "lucide-react";
import { getProofUrl } from "../utils/adminHelpers";

const DetailModal = ({ participant, onClose, onRefresh }) => {
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // --- LOGIKA VERIFIKASI PEMBAYARAN ---
  const handleVerifyPayment = () => {
    // Membuka Custom Modal di depan Detail
    setShowConfirmOverlay(true);
  };

  const executeFinalVerification = async () => {
    setShowConfirmOverlay(false);
    setIsProcessing(true);

    Swal.fire({
      title: "Memproses...",
      text: "Mengupdate database & mengirim email tiket",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        `${API_URL}/api/admin/confirm-payment`,
        { id: participant._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: `BIB #${res.data.bibNumber} telah terbit.`,
          icon: "success",
          confirmButtonColor: "#0f172a",
          timer: 2000,
          showConfirmButton: false,
        });
        onRefresh();
        onClose();
      }
    } catch (error) {
      Swal.fire({
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan pada server.",
        icon: "error",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LOGIKA CHECK-IN ---
  const handleCheckIn = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Hadir",
      text: `Tandai ${participant.fullName} sebagai hadir?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Ya, Hadir!",
      customClass: { popup: "rounded-[2rem]" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.post(
          `${API_URL}/api/admin/checkin`,
          { id: participant._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire({
          title: "Sukses!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onRefresh();
        onClose();
      } catch (error) {
        Swal.fire("Error", "Gagal melakukan check-in", "error");
      }
    }
  };

  if (!participant) return null;

  const DetailItem = ({ label, value, isAlert, icon: Icon }) => (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
      <div
        className={`p-2 rounded-xl ${isAlert ? "bg-red-50 text-red-600" : "bg-white text-slate-400 shadow-sm"}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </span>
        <span
          className={`text-xs font-bold break-words ${isAlert ? "text-red-600" : "text-slate-800"}`}
        >
          {value || "-"}
        </span>
      </div>
    </div>
  );

  const modalContent = (
    <>
      {/* LIGHTBOX */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 cursor-zoom-out"
          onClick={() => setShowImageLightbox(false)}
        >
          <img
            src={getProofUrl(participant.paymentProof)}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in duration-300"
            alt="Bukti"
          />
          <button className="absolute top-10 right-10 text-white/50 hover:text-white">
            <X size={32} />
          </button>
        </div>
      )}

      {/* MODAL UTAMA */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-hidden">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* --- CUSTOM CONFIRMATION OVERLAY (MUNCUL DI DEPAN DETAIL) --- */}
          {showConfirmOverlay && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-6">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 transform animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} className="text-[#9B1B1B]" />
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2 leading-tight">
                  Verifikasi Pembayaran?
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Konfirmasi pembayaran manual untuk <br />
                  <span className="font-black text-slate-900">
                    {participant.fullName}
                  </span>
                  ? Nomor BIB akan terbit otomatis.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={executeFinalVerification}
                    className="w-full py-4 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-lg"
                  >
                    YA, VERIFIKASI LUNAS
                  </button>
                  <button
                    onClick={() => setShowConfirmOverlay(false)}
                    className="w-full py-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-100 transition-all"
                  >
                    BATAL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIDEBAR DETAIL */}
          <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col overflow-y-auto shrink-0">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-2xl">
                  {participant.fullName.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border-2 border-white ${participant.paymentStatus === "paid" ? "bg-emerald-500" : "bg-orange-500"} text-white`}
                >
                  {participant.paymentStatus === "paid" ? (
                    <BadgeCheck size={20} />
                  ) : (
                    <Clock size={20} className="animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">
                {participant.fullName}
              </h2>
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${participant.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
              >
                {participant.paymentStatus === "paid"
                  ? "Status: Lunas"
                  : "Status: Pending"}
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Lampiran Bayar
              </h4>
              {participant.paymentProof ? (
                <div
                  className="group relative rounded-3xl overflow-hidden border-4 border-white shadow-xl cursor-pointer aspect-[3/4]"
                  onClick={() => setShowImageLightbox(true)}
                >
                  <img
                    src={getProofUrl(participant.paymentProof)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt="Bukti"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Maximize2 size={24} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Klik Perbesar
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 bg-white">
                  <ImageIcon size={40} className="mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-tighter">
                    Tidak Ada Bukti
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT DETAIL */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="flex justify-end p-6 border-b border-slate-50">
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              <section>
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                  <User size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">
                    Informasi Registrasi
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetailItem
                    label="NIK / KTP"
                    value={participant.nik}
                    icon={Fingerprint}
                  />
                  <DetailItem
                    label="Email Aktif"
                    value={participant.email}
                    icon={Mail}
                  />
                  <DetailItem
                    label="Nomor WhatsApp"
                    value={participant.phoneNumber}
                    icon={Phone}
                  />
                  <DetailItem
                    label="BIB NUMBER"
                    value={
                      participant.bibNumber
                        ? `#${participant.bibNumber}`
                        : "BELUM TERBIT"
                    }
                    icon={Tag}
                    isAlert={!!participant.bibNumber}
                  />
                  <DetailItem
                    label="UKURAN JERSEY"
                    value={participant.jerseySize}
                    icon={Shirt}
                  />
                  <DetailItem
                    label="KATEGORI LARI"
                    value={`${participant.category} RUN`}
                    icon={CalendarDays}
                  />
                  <DetailItem
                    label="KOTA ASAL"
                    value={participant.city}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="TOTAL BAYAR"
                    value={`Rp ${participant.pricePaid?.toLocaleString("id-ID")}`}
                    icon={Wallet}
                    isAlert
                  />
                </div>
              </section>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 shadow-sm relative overflow-hidden group">
                  <ShieldAlert
                    size={100}
                    className="absolute -right-8 -bottom-8 opacity-[0.03] text-red-600"
                  />
                  <div className="flex items-center gap-2 mb-4 text-red-600">
                    <AlertCircle size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">
                      Riwayat Medis
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed mb-4">
                    {participant.medicalHistory || "TIDAK ADA RIWAYAT PENYAKIT"}
                  </p>
                  <span className="inline-block px-3 py-1 bg-white text-red-600 rounded-lg text-[10px] font-black border border-red-200">
                    GOL DARAH: {participant.bloodType || "N/A"}
                  </span>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <Phone size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">
                      Kontak Darurat
                    </h4>
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-1">
                    {participant.emergencyContact?.name || "-"}
                  </p>
                  <p className="text-xs font-bold text-red-600 mb-2">
                    {participant.emergencyContact?.phone || "-"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                    Hubungan: {participant.emergencyContact?.relation || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Tutup
              </button>

              {participant.paymentStatus !== "paid" ? (
                <button
                  onClick={handleVerifyPayment}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-[#9B1B1B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <BadgeCheck size={18} /> VERIFIKASI LUNAS
                </button>
              ) : !participant.isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-2"
                >
                  <CheckCircle size={18} /> KONFIRMASI HADIR
                </button>
              ) : (
                <div className="px-8 py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black border border-emerald-100 flex items-center gap-2 italic">
                  <CheckCircle size={18} /> TERVERIFIKASI HADIR
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default DetailModal;
