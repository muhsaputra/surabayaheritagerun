import React, { useState } from "react";
import axios from "axios";
import {
  X,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  BadgeCheck,
} from "lucide-react";
import AlertModal from "./AlertModal"; // Import Modal Baru

const ScanModal = ({ participant, onClose, onRefresh }) => {
  // State untuk Alert Modal
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  const showAlert = (config) => setAlertConfig({ ...config, isOpen: true });

  const handleCheckIn = () => {
    // Validasi level frontend
    if (!participant || participant.paymentStatus !== "paid") {
      showAlert({
        type: "error",
        title: "Belum Lunas",
        message: "Peserta ini belum melunasi pembayaran.",
        onConfirm: closeAlert,
        confirmText: "Tutup",
      });
      return;
    }

    // Modal Konfirmasi
    showAlert({
      type: "confirm",
      title: "Konfirmasi Check-in",
      message: `Konfirmasi kehadiran untuk: ${participant.fullName}?`,
      onCancel: closeAlert,
      confirmText: "Ya, Konfirmasi",
      onConfirm: async () => {
        try {
          await axios.post("http://localhost:5001/api/admin/checkin", {
            id: participant._id,
          });
          // Modal Sukses
          showAlert({
            type: "success",
            title: "Berhasil!",
            message: `${participant.fullName} berhasil check-in.`,
            confirmText: "OK",
            onConfirm: () => {
              if (onRefresh) onRefresh();
              onClose();
            },
          });
        } catch (e) {
          // Modal Gagal
          showAlert({
            type: "error",
            title: "Gagal Check-in",
            message: "Terjadi kesalahan koneksi.",
            confirmText: "Coba Lagi",
            onConfirm: closeAlert,
          });
        }
      },
    });
  };

  if (!participant) return null;

  const isPaid = participant.paymentStatus === "paid";
  const isCheckedIn = participant.isCheckedIn;

  return (
    <>
      <AlertModal {...alertConfig} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up relative border-4 border-slate-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 z-10"
          >
            <X size={20} />
          </button>

          <div
            className={`p-8 text-center ${isCheckedIn ? "bg-orange-50" : isPaid ? "bg-green-50" : "bg-red-50"}`}
          >
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white ${isCheckedIn ? "bg-orange-100 text-orange-600" : isPaid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {isCheckedIn ? (
                <AlertCircle size={40} />
              ) : isPaid ? (
                <CheckCircle size={40} />
              ) : (
                <XCircle size={40} />
              )}
            </div>

            <h2
              className={`text-2xl font-black uppercase tracking-tight mb-1 ${isCheckedIn ? "text-orange-700" : isPaid ? "text-green-700" : "text-red-700"}`}
            >
              {isCheckedIn
                ? "SUDAH CHECK-IN"
                : isPaid
                  ? "SIAP CHECK-IN"
                  : "BELUM LUNAS"}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Status Peserta
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {participant.fullName}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase">
                <User size={12} /> {participant.category} •{" "}
                {participant.jerseySize}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Nomor BIB
                </span>
                <span className="text-2xl font-black text-red-600">
                  {participant.bibNumber || "-"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Daftar
                </span>
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-700 h-8">
                  <Clock size={14} />{" "}
                  {new Date(participant.createdAt).toLocaleDateString("id-ID")}
                </div>
              </div>
            </div>

            <div className="pt-2">
              {!isCheckedIn && isPaid ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-black hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
                >
                  <BadgeCheck size={24} /> KONFIRMASI CHECK-IN
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Tutup & Scan Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScanModal;
