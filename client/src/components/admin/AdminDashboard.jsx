import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FileDown, Loader2 } from "lucide-react"; // Import ikon tambahan

import Sidebar from "./Sidebar";
import DashboardPanel from "./panels/DashboardPanel";
import ScannerPanel from "./panels/ScannerPanel";
import SettingsPanel from "./panels/SettingsPanel";
import LogPanel from "./panels/LogPanel";
import ScanModal from "./modals/ScanModal";
import AlertModal from "./modals/AlertModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scanResult, setScanResult] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [resumeScan, setResumeScan] = useState(null);
  const [isExporting, setIsExporting] = useState(false); // State untuk loading export

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

  // --- 1. GLOBAL AXIOS CONFIGURATION ---
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;

        if (
          config.url &&
          (config.url.startsWith("http://localhost") ||
            config.url.startsWith("/api"))
        ) {
          const path = config.url.split("/api")[1];
          config.url = `${API_URL}/api${path}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [API_URL]);

  useEffect(() => {
    document.title = "Admin Dashboard | Surabaya Heritage Run";
  }, []);

  // --- 2. FUNGSI EXPORT EXCEL (Sesuai Update Baru) ---
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Menggunakan token admin untuk otorisasi download
      const token = localStorage.getItem("adminToken");

      // Cara paling aman mendownload file dengan token: menggunakan axios blob
      const response = await axios({
        url: `${API_URL}/api/admin/export-excel`,
        method: "GET",
        responseType: "blob", // Penting untuk data biner seperti Excel
      });

      // Membuat URL temporary untuk download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SHR_Participants_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error);
      setAlertConfig({
        isOpen: true,
        type: "error",
        title: "Export Gagal",
        message: "Terjadi kesalahan saat mengunduh data excel.",
        confirmText: "Tutup",
        onConfirm: closeAlert,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoutProcess = () => {
    setAlertConfig({
      isOpen: true,
      type: "danger",
      title: "Keluar dari Panel?",
      message: "Sesi Anda akan diakhiri. Anda perlu login kembali.",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      onCancel: closeAlert,
      onConfirm: () => {
        localStorage.clear(); // Bersihkan semua sekaligus
        navigate("/login");
      },
    });
  };

  const processScanResult = async (id, resumeFunc) => {
    setResumeScan(() => resumeFunc);
    try {
      const res = await axios.get(`${API_URL}/api/admin/participants`);
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
      const isUnauthorized = error.response?.status === 401;
      setAlertConfig({
        isOpen: true,
        type: "error",
        title: isUnauthorized ? "Sesi Berakhir" : "Gagal Memuat Data",
        message: isUnauthorized
          ? "Sesi login Anda telah habis atau tidak valid. Silakan login kembali."
          : "Terjadi kesalahan koneksi ke server.",
        confirmText: isUnauthorized ? "Ke Halaman Login" : "Tutup",
        onConfirm: () => {
          closeAlert();
          if (isUnauthorized) {
            localStorage.clear();
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
      <AlertModal {...alertConfig} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogoutProcess}
      />

      <div className="md:ml-64 p-6 md:p-10 transition-all">
        {/* TOP BAR / HEADER DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {activeTab === "dashboard"
                ? "Overview Peserta"
                : activeTab.toUpperCase()}
            </h1>
            <p className="text-slate-500 text-sm italic">
              Surabaya Heritage Run 2026
            </p>
          </div>

          {/* TOMBOL EXCEL GLOBAL (Hanya muncul di dashboard) */}
          {activeTab === "dashboard" && (
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              {isExporting ? "Mengekspor..." : "Export Data (Excel)"}
            </button>
          )}
        </div>

        {/* RENDER PANEL BERDASARKAN TAB */}
        <div className="animate-in fade-in duration-500">
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
      </div>

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
