const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController"); // Import Auth Controller
const { protect } = require("../middleware/authMiddleware"); // Import Middleware Proteksi

// ==========================================
// 1. ROUTE AUTH (PUBLIC)
// ==========================================
// URL: /api/admin/login
router.post("/login", authController.login);

// ==========================================
// 2. ROUTE TERPROTEKSI (WAJIB TOKEN)
// ==========================================
// Semua route di bawah ini hanya bisa diakses jika Header memiliki Authorization Bearer <token>

// --- DASHBOARD & DATA PESERTA ---
router.get("/participants", protect, adminController.getParticipants);

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
