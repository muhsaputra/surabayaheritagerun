import React, { useState } from "react";
import axios from "axios";
import {
  X,
  User,
  HeartPulse,
  BadgeCheck,
  CheckCircle,
  ImageIcon,
  CalendarClock,
  Tag,
  Wallet,
  Phone,
  MapPin,
} from "lucide-react";
import { getProofUrl } from "../utils/adminHelpers";
import AlertModal from "../modals/AlertModal";

const DetailModal = ({ participant, onClose, onRefresh }) => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const showAlert = (config) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  // --- LOGIKA VERIFIKASI PEMBAYARAN ---
  const handleManualConfirm = (id, name) => {
    showAlert({
      type: "confirm",
      title: "Verifikasi Pembayaran?",
      message: `Konfirmasi pembayaran manual untuk ${name}? BIB akan otomatis terbit.`,
      onCancel: closeAlert,
      confirmText: "Ya, Verifikasi",
      onConfirm: async () => {
        try {
          await axios.post("http://localhost:5001/api/admin/confirm-payment", {
            id,
          });

          showAlert({
            type: "success",
            title: "Berhasil!",
            message: "Pembayaran diverifikasi dan email tiket telah dikirim.",
            confirmText: "Selesai",
            onConfirm: () => {
              if (onRefresh) onRefresh();
              onClose();
            },
          });
        } catch (e) {
          // Menangkap pesan error 400 dari backend
          const errMsg =
            e.response?.data?.message || "Terjadi kesalahan server.";
          showAlert({
            type: "error",
            title: "Gagal Verifikasi",
            message: errMsg,
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
      title: "Konfirmasi Check-in",
      message: `Lakukan check-in untuk peserta ${name}?`,
      onCancel: closeAlert,
      confirmText: "Check-in Sekarang",
      onConfirm: async () => {
        try {
          await axios.post("http://localhost:5001/api/admin/checkin", { id });
          showAlert({
            type: "success",
            title: "Check-in Berhasil!",
            message: "Data kehadiran telah diperbarui.",
            confirmText: "OK",
            onConfirm: () => {
              if (onRefresh) onRefresh();
              onClose();
            },
          });
        } catch (e) {
          showAlert({
            type: "error",
            title: "Gagal",
            message: e.response?.data?.message || "Gagal check-in.",
            confirmText: "Tutup",
            onConfirm: closeAlert,
          });
        }
      },
    });
  };

  if (!participant) return null;

  const DetailItem = ({ label, value, isAlert, icon: Icon }) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-[10px] text-slate-400 font-black uppercase mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} className="text-slate-400" />} {label}
      </p>
      <p
        className={`text-sm font-bold break-words ${isAlert ? "text-red-600" : "text-slate-900"}`}
      >
        {value || "-"}
      </p>
    </div>
  );

  const getPhaseStyles = (phase) => {
    const p = (phase || "").toLowerCase();
    if (p.includes("presale")) return "bg-purple-600 text-white";
    if (p.includes("early")) return "bg-blue-600 text-white";
    return "bg-slate-600 text-white";
  };

  return (
    <>
      <AlertModal {...alertConfig} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-slide-up relative border border-white/20">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white z-50 transition-all"
          >
            <X size={20} />
          </button>

          {/* SIDEBAR INFO */}
          <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-200 flex flex-col items-center overflow-y-auto">
            <div className="w-28 h-28 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-5xl mb-6 shadow-2xl rotate-3">
              {participant.fullName.charAt(0)}
            </div>

            <div
              className={`mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getPhaseStyles(participant.registrationPhase)}`}
            >
              {participant.registrationPhase || "REGULAR"} PHASE
            </div>

            <h2 className="font-serif font-black text-2xl text-slate-900 text-center leading-tight mb-2">
              {participant.fullName}
            </h2>

            <div className="flex gap-2 mb-8">
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${participant.paymentStatus === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
              >
                {participant.paymentStatus === "paid" ? "LUNAS" : "MENUNGGU"}
              </span>
              <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-white uppercase">
                {participant.category}
              </span>
            </div>

            {/* Bukti Bayar Section */}
            <div className="w-full mt-auto">
              {participant.paymentProof ? (
                <div className="group relative rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                  <img
                    src={getProofUrl(participant.paymentProof)}
                    alt="Bukti"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform"
                  />
                  <a
                    href={getProofUrl(participant.paymentProof)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                  >
                    <ImageIcon size={16} className="mr-2" /> Lihat Full
                  </a>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-xs font-bold">
                  Belum ada bukti transfer
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Informasi Registrasi
                </h3>
                <p className="text-sm text-slate-400">
                  Data lengkap peserta sesuai formulir
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <DetailItem
                label="NIK / Paspor"
                value={participant.nik}
                icon={BadgeCheck}
              />
              <DetailItem
                label="Nomor BIB"
                value={
                  participant.bibNumber ? `#${participant.bibNumber}` : "Proses"
                }
                isAlert={!!participant.bibNumber}
                icon={Tag}
              />
              <DetailItem
                label="Total Bayar"
                value={`Rp ${participant.pricePaid?.toLocaleString("id-ID")}`}
                isAlert={true}
                icon={Wallet}
              />
              <DetailItem
                label="No. WhatsApp"
                value={participant.phoneNumber}
                icon={Phone}
              />
              <DetailItem
                label="Domisili"
                value={`${participant.city}`}
                icon={MapPin}
              />
              <DetailItem
                label="Ukuran Jersey"
                value={participant.jerseySize}
                icon={User}
              />
            </div>

            <div className="bg-red-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden mb-10">
              <HeartPulse
                size={120}
                className="absolute -right-4 -bottom-4 opacity-10 rotate-12"
              />
              <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <HeartPulse size={18} /> Kondisi Medis & Darurat
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div>
                  <p className="text-[10px] text-red-200 font-bold uppercase">
                    Riwayat & Gol. Darah
                  </p>
                  <p className="font-bold text-lg">
                    {participant.medicalHistory} (Gol: {participant.bloodType})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-red-200 font-bold uppercase">
                    Kontak Darurat
                  </p>
                  <p className="font-bold">
                    {participant.emergencyContact?.name} -{" "}
                    {participant.emergencyContact?.phone}
                  </p>
                  <p className="text-xs text-red-100 opacity-80">
                    {participant.emergencyContact?.relation}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-end gap-4 mt-auto pt-8 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition"
              >
                Tutup
              </button>

              {participant.paymentStatus !== "paid" && (
                <button
                  onClick={() =>
                    handleManualConfirm(participant._id, participant.fullName)
                  }
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <BadgeCheck size={20} /> Verifikasi Lunas
                </button>
              )}

              {participant.paymentStatus === "paid" &&
                !participant.isCheckedIn && (
                  <button
                    onClick={() =>
                      handleCheckIn(participant._id, participant.fullName)
                    }
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-300 hover:bg-black transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={20} /> Konfirmasi Kehadiran
                  </button>
                )}

              {participant.isCheckedIn && (
                <div className="px-8 py-4 bg-green-100 text-green-700 rounded-2xl font-black border-2 border-green-200 flex items-center gap-2">
                  <CheckCircle size={20} /> Peserta Sudah Hadir
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailModal;
