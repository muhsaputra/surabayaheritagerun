const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ==========================================
// 1. ROUTE AUTH (PUBLIC)
// ==========================================
router.post("/login", authController.login);

// ==========================================
// 2. ROUTE TERPROTEKSI (WAJIB TOKEN)
// ==========================================

// --- DASHBOARD & DATA PESERTA ---
router.get("/participants", protect, adminController.getParticipants);

// FIX: Tambahkan middleware 'protect' agar sinkron dengan request Axios di Frontend
// Ini memastikan hanya Admin yang bisa download data sensitif ini.
router.get("/export-excel", protect, adminController.exportExcel);

// --- AKSI UTAMA (VERIFIKASI & CHECK-IN) ---
router.post("/confirm-payment", protect, adminController.confirmPayment);
router.post("/checkin", protect, adminController.checkIn);

// --- LOG AKTIVITAS (AUDIT TRAIL) ---
router.get("/logs", protect, adminController.getLogs);

// --- PENGATURAN EVENT (KONFIGURASI, HARGA & KUOTA) ---
router.get("/config", protect, adminController.getConfig);
router.post("/config", protect, adminController.updateConfig);
router.get("/stats-count", protect, adminController.getStatsCount);

module.exports = router;
