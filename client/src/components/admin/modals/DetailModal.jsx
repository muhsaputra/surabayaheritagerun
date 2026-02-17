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
  ExternalLink,
  Shirt,
  Fingerprint,
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

  // UPDATED: DetailItem tanpa 'truncate' agar teks muncul full
  const DetailItem = ({ label, value, isAlert, icon: Icon, subValue }) => (
    <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-red-100 h-full">
      <div
        className={`p-2.5 rounded-xl flex-shrink-0 ${isAlert ? "bg-red-50 text-red-600" : "bg-white text-slate-400 shadow-sm"}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex flex-col min-w-0 w-full">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </span>
        <span
          className={`text-sm font-bold break-words leading-relaxed ${isAlert ? "text-red-600" : "text-slate-700"}`}
        >
          {value || "-"}
        </span>
        {subValue && (
          <span className="text-[10px] text-slate-400 mt-1 leading-tight">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AlertModal {...alertConfig} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-white/20">
          {/* SIDEBAR */}
          <div className="w-full md:w-[340px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col overflow-y-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center font-serif text-5xl font-bold shadow-2xl">
                  {participant.fullName.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-2 rounded-xl border-4 border-slate-50 ${participant.paymentStatus === "paid" ? "bg-green-500" : "bg-red-500"} text-white shadow-lg`}
                >
                  <BadgeCheck size={20} />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3 uppercase tracking-tight break-words">
                {participant.fullName}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">
                  {participant.category} CATEGORY
                </span>
                <span
                  className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest ${participant.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {participant.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Bukti Transfer
              </h4>
              {participant.paymentProof ? (
                <div className="group relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl aspect-[4/5] bg-slate-200">
                  <img
                    src={getProofUrl(participant.paymentProof)}
                    alt="Transfer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <a
                    href={getProofUrl(participant.paymentProof)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-3 backdrop-blur-sm"
                  >
                    <ExternalLink size={32} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Lihat Fullscreen
                    </span>
                  </a>
                </div>
              ) : (
                <div className="h-56 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center p-8 bg-white/50">
                  <ImageIcon size={40} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                    Belum Ada Bukti
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all z-10"
            >
              <X size={28} />
            </button>

            <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  <User size={14} /> Informasi Personal
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <DetailItem
                    label="NIK / Identitas"
                    value={participant.nik}
                    icon={Fingerprint}
                  />
                  <DetailItem
                    label="Email Peserta"
                    value={participant.email}
                    icon={Mail}
                  />
                  <DetailItem
                    label="WhatsApp"
                    value={participant.phoneNumber || participant.whatsapp}
                    icon={Phone}
                  />
                  <DetailItem
                    label="BIB Number"
                    value={
                      participant.bibNumber
                        ? `#${participant.bibNumber}`
                        : "MENUNGGU VERIFIKASI"
                    }
                    icon={Tag}
                    isAlert={!!participant.bibNumber}
                  />
                  <DetailItem
                    label="Ukuran Jersey"
                    value={participant.jerseySize}
                    icon={Shirt}
                    subValue="Pastikan stok tersedia saat distribusi"
                  />
                  <DetailItem
                    label="Kota Domisili"
                    value={participant.city}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="Total Biaya"
                    value={`Rp ${participant.pricePaid?.toLocaleString("id-ID")}`}
                    icon={Wallet}
                    isAlert
                  />
                  <DetailItem
                    label="Fase Pendaftaran"
                    value={participant.registrationPhase || "Regular Phase"}
                    icon={CalendarDays}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-4">
                {/* MEDICAL INFO - Full Text Enabled */}
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-slate-800">
                  <ShieldAlert
                    size={120}
                    className="absolute -right-8 -bottom-8 opacity-5 text-red-500"
                  />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-red-500">
                    <HeartPulse size={18} /> Kondisi Kesehatan
                  </h4>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                        Riwayat Medis & Alergi
                      </p>
                      <p className="text-base font-bold leading-relaxed whitespace-normal break-words">
                        {participant.medicalHistory ||
                          "TIDAK ADA RIWAYAT MEDIS"}
                      </p>
                    </div>
                    <div className="inline-block px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                        Golongan Darah
                      </p>
                      <p className="text-xl font-black text-red-500">
                        {participant.bloodType || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EMERGENCY CONTACT - Full Text Enabled */}
                <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 shadow-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-red-600">
                    <Phone size={18} /> Kontak Darurat
                  </h4>
                  <div className="space-y-5">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        Nama Kontak
                      </p>
                      <span className="text-xl font-black text-slate-900 break-words leading-tight">
                        {participant.emergencyContact?.name || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        Nomor Telepon
                      </p>
                      <span className="text-lg font-black text-red-600">
                        {participant.emergencyContact?.phone || "-"}
                      </span>
                    </div>
                    <div className="inline-block px-4 py-2 bg-white rounded-xl border border-red-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                        Hubungan
                      </p>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        {participant.emergencyContact?.relation || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Surabaya Heritage Run 2026
                </p>
                <p className="text-[9px] text-slate-400 italic">
                  Verify all data before confirmation.
                </p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
                >
                  Kembali
                </button>

                {participant.paymentStatus !== "paid" && (
                  <button
                    onClick={() =>
                      handleManualConfirm(participant._id, participant.fullName)
                    }
                    className="flex-1 sm:flex-none px-10 py-4 bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <BadgeCheck size={20} /> VERIFIKASI LUNAS
                  </button>
                )}

                {participant.paymentStatus === "paid" &&
                  !participant.isCheckedIn && (
                    <button
                      onClick={() =>
                        handleCheckIn(participant._id, participant.fullName)
                      }
                      className="flex-1 sm:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle size={20} /> KONFIRMASI HADIR
                    </button>
                  )}

                {participant.isCheckedIn && (
                  <div className="flex-1 sm:flex-none px-10 py-4 bg-green-100 text-green-700 rounded-2xl text-sm font-black flex items-center justify-center gap-3 border border-green-200 shadow-inner">
                    <CheckCircle size={20} /> PESERTA SUDAH HADIR
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailModal;
