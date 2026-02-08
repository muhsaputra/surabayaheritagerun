import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

// Import Komponen Pecahan
import Sidebar from "./Sidebar";
import DashboardPanel from "./panels/DashboardPanel";
import ScannerPanel from "./panels/ScannerPanel";
import SettingsPanel from "./panels/SettingsPanel";
import LogPanel from "./panels/LogPanel";

// Import Modal
import ScanModal from "./modals/ScanModal";
import AlertModal from "./modals/AlertModal"; // <--- 1. IMPORT ALERT MODAL

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- STATE SCANNER ---
  const [scanResult, setScanResult] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [resumeScan, setResumeScan] = useState(null);

  // --- STATE ALERT MODAL (Untuk Logout & Error Global) ---
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  // Ubah Title Browser
  useEffect(() => {
    document.title = "Admin Dashboard | Surabaya Heritage Run";
  }, []);

  // --- 2. LOGIKA LOGOUT MENGGUNAKAN MODAL ---
  const handleLogoutProcess = () => {
    setAlertConfig({
      isOpen: true,
      type: "danger", // Pakai tipe 'danger' agar tombol jadi merah
      title: "Keluar dari Panel?",
      message:
        "Sesi Anda akan diakhiri. Anda perlu login kembali untuk mengakses halaman ini.",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      onCancel: closeAlert,
      onConfirm: () => {
        localStorage.removeItem("isAdminAuthenticated");
        navigate("/login");
      },
    });
  };

  // --- FUNGSI PROSES SCAN QR ---
  const processScanResult = async (id, resumeFunc) => {
    setResumeScan(() => resumeFunc);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

      // TAMBAHKAN withCredentials: true agar cookie login terkirim ke server Koyeb
      const res = await axios.get(`${apiUrl}/api/admin/participants`, {
        withCredentials: true,
      });

      if (res.data.success) {
        const found = res.data.data.find((p) => p._id === id);

        if (found) {
          setScanResult(found);
          setIsScanModalOpen(true);
        } else {
          setAlertConfig({
            isOpen: true,
            type: "error",
            title: "Tidak Ditemukan",
            message: "Data peserta tidak ditemukan dalam sistem.",
            confirmText: "Scan Lagi",
            onConfirm: () => {
              closeAlert();
              if (resumeFunc) resumeFunc();
            },
          });
        }
      }
    } catch (error) {
      console.error("🔥 Scan Error:", error);

      // Jika error 401, arahkan admin untuk login ulang
      const isUnauthorized = error.response?.status === 401;

      setAlertConfig({
        isOpen: true,
        type: "error",
        title: isUnauthorized ? "Sesi Berakhir" : "Gagal Memuat Data",
        message: isUnauthorized
          ? "Sesi login Anda telah habis. Silakan login kembali untuk melanjutkan pemindaian."
          : "Terjadi kesalahan koneksi ke server. Pastikan backend aktif.",
        confirmText: isUnauthorized ? "Ke Halaman Login" : "Tutup",
        onConfirm: () => {
          closeAlert();
          if (isUnauthorized) {
            localStorage.removeItem("isAdminAuthenticated");
            navigate("/login");
          } else if (resumeFunc) {
            resumeFunc();
          }
        },
      });
    }
  };

  const handleCloseScanModal = () => {
    setIsScanModalOpen(false);
    setScanResult(null);
    if (resumeScan) resumeScan();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      {/* 3. RENDER ALERT MODAL DI LEVEL TERATAS */}
      <AlertModal {...alertConfig} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogoutProcess}
      />

      <div className="md:ml-64 p-6 md:p-10 transition-all">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
          <h1 className="font-serif font-bold text-lg">Admin Panel</h1>
          <button className="p-2 bg-white/10 rounded-lg">
            <Users size={20} />
          </button>
        </div>

        {/* Content Switcher */}
        {activeTab === "settings" ? (
          <SettingsPanel />
        ) : activeTab === "scan" ? (
          <ScannerPanel onScanSuccess={processScanResult} />
        ) : activeTab === "logs" ? (
          <LogPanel />
        ) : (
          <DashboardPanel />
        )}
      </div>

      {/* --- MODAL HASIL SCAN --- */}
      {isScanModalOpen && scanResult && (
        <ScanModal
          participant={scanResult}
          onClose={handleCloseScanModal}
          onRefresh={() => {}}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
