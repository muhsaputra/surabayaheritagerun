import React, { useState } from "react";
import axios from "axios";
import {
  X,
  User,
  HeartPulse,
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
} from "lucide-react";
import { getProofUrl } from "../utils/adminHelpers";
import AlertModal from "../modals/AlertModal";

const DetailModal = ({ participant, onClose, onRefresh }) => {
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://bumpy-charleen-muhsaputra-1d494e9b.koyeb.app";

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  const showAlert = (config) => setAlertConfig({ ...config, isOpen: true });

  const handleManualConfirm = (id, name) => {
    showAlert({
      type: "confirm",
      title: "Verifikasi Pembayaran?",
      message: `Konfirmasi pembayaran manual untuk ${name}? Nomor BIB akan dikirim ke email peserta.`,
      onCancel: closeAlert,
      confirmText: "Ya, Verifikasi",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("adminToken");
          await axios.post(
            `${API_URL}/api/admin/confirm-payment`,
            { id },
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            },
          );
          showAlert({
            type: "success",
            title: "Verifikasi Berhasil",
            message: "Status pembayaran diperbarui dan tiket telah dikirim.",
            confirmText: "Selesai",
            onConfirm: () => {
              if (onRefresh) onRefresh();
              onClose();
            },
          });
        } catch (e) {
          showAlert({
            type: "error",
            title: "Gagal Verifikasi",
            message: e.response?.data?.message || "Terjadi kesalahan server.",
            confirmText: "Tutup",
            onConfirm: closeAlert,
          });
        }
      },
    });
  };

  const handleCheckIn = (id, name) => {
    showAlert({
      type: "confirm",
      title: "Konfirmasi Kehadiran",
      message: `Tandai ${name} sebagai hadir di lokasi acara?`,
      onCancel: closeAlert,
      confirmText: "Ya, Hadir",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("adminToken");
          await axios.post(
            `${API_URL}/api/admin/checkin`,
            { id },
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            },
          );
          showAlert({
            type: "success",
            title: "Check-in Sukses",
            message: "Kehadiran peserta berhasil dicatat.",
            confirmText: "Siap",
            onConfirm: () => {
              if (onRefresh) onRefresh();
              onClose();
            },
          });
        } catch (e) {
          showAlert({
            type: "error",
            title: "Gagal",
            message: e.response?.data?.message || "Gagal melakukan check-in.",
            confirmText: "Tutup",
            onConfirm: closeAlert,
          });
        }
      },
    });
  };

  if (!participant) return null;

  const DetailItem = ({ label, value, isAlert, icon: Icon, subValue }) => (
    <div className="group flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-red-100 h-full">
      <div
        className={`p-2 rounded-xl flex-shrink-0 ${isAlert ? "bg-red-50 text-red-600" : "bg-white text-slate-400 shadow-sm"}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex flex-col min-w-0 w-full">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </span>
        <span
          className={`text-xs font-bold break-words leading-relaxed ${isAlert ? "text-red-600" : "text-slate-700"}`}
        >
          {value || "-"}
        </span>
        {subValue && (
          <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AlertModal {...alertConfig} />

      {/* POP-UP LIGHTBOX BUKTI TRANSFER (Full Screen Over Everything) */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in"
          onClick={() => setShowImageLightbox(false)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={40} />
          </button>
          <img
            src={getProofUrl(participant.paymentProof)}
            alt="Bukti"
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* FIX: Gunakan 'fixed inset-0' untuk menutupi seluruh layar tanpa terpengaruh padding parent */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
        {/* CONTAINER UTAMA (Max-width dikurangi agar modal lebih kecil/compact) */}
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row relative overflow-hidden animate-slide-up">
          {/* SIDEBAR (300px lebih ramping) */}
          <div className="w-full md:w-[280px] bg-slate-50 border-r border-slate-100 p-6 flex flex-col overflow-y-auto shrink-0">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-[1.8rem] bg-slate-900 text-white flex items-center justify-center font-serif text-3xl font-bold shadow-xl">
                  {participant.fullName.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg ${participant.paymentStatus === "paid" ? "bg-green-500" : "bg-red-500"} text-white shadow-lg`}
                >
                  <BadgeCheck size={16} />
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight break-words">
                {participant.fullName}
              </h2>
              <div className="flex flex-wrap justify-center gap-1.5">
                <span className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">
                  {participant.category}
                </span>
                <span
                  className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest ${participant.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {participant.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Bukti Transfer
              </h4>
              {participant.paymentProof ? (
                <div
                  className="group relative rounded-[1.2rem] overflow-hidden border-2 border-white shadow-md aspect-[4/5] bg-slate-200 cursor-pointer"
                  onClick={() => setShowImageLightbox(true)}
                >
                  <img
                    src={getProofUrl(participant.paymentProof)}
                    alt="Transfer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]">
                    <Maximize2 size={20} />
                    <span className="text-[9px] font-black uppercase">
                      Zoom Foto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-[1.2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center p-4 bg-white/50">
                  <ImageIcon size={28} className="mb-1 opacity-20" />
                  <p className="text-[8px] font-bold uppercase tracking-widest">
                    No Proof
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            {/* Header internal untuk tombol close agar bar putih di atas hilang */}
            <div className="flex justify-end p-4 border-b border-slate-50 bg-white">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] mb-4">
                  <User size={12} /> Data Personal
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <DetailItem
                    label="NIK"
                    value={participant.nik}
                    icon={Fingerprint}
                  />
                  <DetailItem
                    label="Email"
                    value={participant.email}
                    icon={Mail}
                  />
                  <DetailItem
                    label="WhatsApp"
                    value={participant.phoneNumber || participant.whatsapp}
                    icon={Phone}
                  />
                  <DetailItem
                    label="BIB"
                    value={
                      participant.bibNumber
                        ? `#${participant.bibNumber}`
                        : "NOT VERIFIED"
                    }
                    icon={Tag}
                    isAlert={!!participant.bibNumber}
                  />
                  <DetailItem
                    label="Jersey"
                    value={participant.jerseySize}
                    icon={Shirt}
                  />
                  <DetailItem
                    label="Domisili"
                    value={participant.city}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="Biaya"
                    value={`Rp ${participant.pricePaid?.toLocaleString("id-ID")}`}
                    icon={Wallet}
                    isAlert
                  />
                  <DetailItem
                    label="Fase"
                    value={participant.registrationPhase || "Regular"}
                    icon={CalendarDays}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white relative overflow-hidden shadow-xl border border-slate-800">
                  <ShieldAlert
                    size={80}
                    className="absolute -right-6 -bottom-6 opacity-5 text-red-500"
                  />
                  <h4 className="text-[9px] font-black uppercase tracking-widest mb-3 text-red-500 flex items-center gap-2">
                    <HeartPulse size={14} /> Medical
                  </h4>
                  <p className="text-xs font-bold leading-relaxed mb-3">
                    {participant.medicalHistory || "TIDAK ADA"}
                  </p>
                  <span className="text-[9px] bg-white/10 px-2 py-1 rounded text-red-400 font-bold border border-white/10">
                    Gol: {participant.bloodType || "-"}
                  </span>
                </div>

                <div className="p-6 bg-red-50 rounded-[1.5rem] border border-red-100 shadow-sm">
                  <h4 className="text-[9px] font-black uppercase tracking-widest mb-3 text-red-600 flex items-center gap-2">
                    <Phone size={14} /> Emergency
                  </h4>
                  <p className="text-sm font-black text-slate-900">
                    {participant.emergencyContact?.name || "-"}
                  </p>
                  <p className="text-xs font-bold text-red-600 mb-1">
                    {participant.emergencyContact?.phone || "-"}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase">
                    {participant.emergencyContact?.relation || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
              >
                Kembali
              </button>
              {participant.paymentStatus !== "paid" && (
                <button
                  onClick={() =>
                    handleManualConfirm(participant._id, participant.fullName)
                  }
                  className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <BadgeCheck size={16} /> VERIFIKASI LUNAS
                </button>
              )}
              {participant.paymentStatus === "paid" &&
                !participant.isCheckedIn && (
                  <button
                    onClick={() =>
                      handleCheckIn(participant._id, participant.fullName)
                    }
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-black transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> KONFIRMASI HADIR
                  </button>
                )}
              {participant.isCheckedIn && (
                <div className="px-6 py-3 bg-green-100 text-green-700 rounded-xl text-xs font-black border border-green-200 flex items-center gap-2">
                  <CheckCircle size={16} /> SUDAH HADIR
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.2s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default DetailModal;
