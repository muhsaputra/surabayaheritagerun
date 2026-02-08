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

  const DetailItem = ({ label, value, isAlert, icon: Icon, subValue }) => (
    <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-red-100">
      <div
        className={`p-2.5 rounded-xl ${isAlert ? "bg-red-50 text-red-600" : "bg-white text-slate-400 shadow-sm"}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </span>
        <span
          className={`text-sm font-bold truncate ${isAlert ? "text-red-600" : "text-slate-700"}`}
        >
          {value || "-"}
        </span>
        {subValue && (
          <span className="text-[10px] text-slate-400 mt-0.5">{subValue}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AlertModal {...alertConfig} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-white/20">
          {/* SIDEBAR: Status & Bukti Transfer */}
          <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col overflow-y-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-800 to-black text-white flex items-center justify-center font-serif text-4xl font-bold shadow-xl">
                  {participant.fullName.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg border-4 border-slate-50 ${participant.paymentStatus === "paid" ? "bg-green-500" : "bg-red-500"} text-white`}
                >
                  <BadgeCheck size={16} />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">
                {participant.fullName}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
                  {participant.category} RUN
                </span>
                <span
                  className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${participant.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {participant.paymentStatus === "paid" ? "LUNAS" : "PENDING"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Bukti Pembayaran
              </h4>
              {participant.paymentProof ? (
                <div className="group relative rounded-3xl overflow-hidden border-2 border-white shadow-lg aspect-square">
                  <img
                    src={getProofUrl(participant.paymentProof)}
                    alt="Transfer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <a
                    href={getProofUrl(participant.paymentProof)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                  >
                    <ExternalLink size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Buka Gambar
                    </span>
                  </a>
                </div>
              ) : (
                <div className="h-48 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center p-6">
                  <ImageIcon size={32} className="mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                    Belum Mengunggah Bukti
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN: Data Detail */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-10 overflow-y-auto flex-1">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                  <User size={12} /> Profil Peserta
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetailItem
                    label="NIK / Identitas"
                    value={participant.nik}
                    icon={BadgeCheck}
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
                    label="BIB Number"
                    value={
                      participant.bibNumber
                        ? `#${participant.bibNumber}`
                        : "Menunggu Verifikasi"
                    }
                    icon={Tag}
                    isAlert={!!participant.bibNumber}
                  />
                  <DetailItem
                    label="Jersey Size"
                    value={participant.jerseySize}
                    icon={Shirt}
                    subValue="Ukuran sudah dikonfirmasi"
                  />
                  <DetailItem
                    label="Domisili"
                    value={participant.city}
                    icon={MapPin}
                  />
                  <DetailItem
                    label="Total Tagihan"
                    value={`Rp ${participant.pricePaid?.toLocaleString("id-ID")}`}
                    icon={Wallet}
                    isAlert
                  />
                  <DetailItem
                    label="Fase Daftar"
                    value={participant.registrationPhase || "Regular"}
                    icon={CalendarDays}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
                  <ShieldAlert
                    size={100}
                    className="absolute -right-6 -bottom-6 opacity-10"
                  />
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-red-400">
                    <HeartPulse size={14} /> Informasi Medis
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Kondisi Kesehatan
                      </p>
                      <p className="text-sm font-bold">
                        {participant.medicalHistory} (Gol:{" "}
                        {participant.bloodType})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-red-600">
                    <Phone size={14} /> Kontak Darurat
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">
                        {participant.emergencyContact?.name}
                      </span>
                      <span className="text-xs font-bold text-red-600">
                        {participant.emergencyContact?.phone}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase mt-1">
                        Hubungan: {participant.emergencyContact?.relation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Admin Panel • Surabaya Heritage Run 2026
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Tutup
                </button>

                {participant.paymentStatus !== "paid" && (
                  <button
                    onClick={() =>
                      handleManualConfirm(participant._id, participant.fullName)
                    }
                    className="px-8 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
                  >
                    <BadgeCheck size={18} /> Verifikasi Lunas
                  </button>
                )}

                {participant.paymentStatus === "paid" &&
                  !participant.isCheckedIn && (
                    <button
                      onClick={() =>
                        handleCheckIn(participant._id, participant.fullName)
                      }
                      className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-300 hover:bg-black transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={18} /> Konfirmasi Hadir
                    </button>
                  )}

                {participant.isCheckedIn && (
                  <div className="px-8 py-3.5 bg-green-100 text-green-700 rounded-2xl text-sm font-black flex items-center gap-2 border border-green-200">
                    <CheckCircle size={18} /> Peserta Sudah Hadir
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
