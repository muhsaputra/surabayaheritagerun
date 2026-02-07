const express = require("express");
const router = express.Router();

// 1. IMPORT MIDDLEWARE
const uploadCloud = require("../utils/uploadCloud");

// 2. IMPORT CONTROLLERS
const participantController = require("../controllers/participantController");
const paymentController = require("../controllers/paymentController");
// const registrationController = require("../controllers/registrationController"); // (Opsional/Legacy)

// ==========================================
// 1. ROUTES PUBLIC (Landing Page & User)
// ==========================================

// 👇 [FIX UTAMA] Route ini WAJIB ADA agar Frontend tidak error 404
router.get("/landing/config", participantController.getPublicConfig);

// Route Pendaftaran (Arahkan ke participantController agar Cek Kuota jalan)
router.post("/register", participantController.register);

// Route Cek Status Pendaftaran
router.post("/check-status", participantController.getParticipantStatus);
// Alternatif jika frontend akses via GET (sesuaikan dengan frontend Anda)
router.get("/status", participantController.getParticipantStatus);

// ==========================================
// 2. ROUTES PAYMENT & UPLOAD
// ==========================================
router.post("/payment/pay", paymentController.createTransaction);
router.post("/payment/success", paymentController.paymentSuccess);

// Upload Bukti Bayar
router.post(
  "/payment/upload",
  uploadCloud.single("paymentProof"),
  participantController.uploadPaymentProof,
);

// ==========================================
// 3. ROUTES ADMIN (Opsional)
// ==========================================
// Jika di server.js sudah ada app.use('/api/admin', adminRoutes),
// maka route admin di sini sebenarnya duplikat/tidak perlu.
// Tapi kalau masih dipakai, pastikan controllernya benar.

module.exports = router;
