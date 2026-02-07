const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");

// ✅ IMPORT CLOUDINARY (Pastikan path-nya benar)
const uploadCloud = require("../utils/uploadCloud");

// --- ROUTES ---

// 1. Upload Bukti Bayar (WAJIB PAKAI uploadCloud)
router.post(
  "/upload-payment",
  uploadCloud.single("paymentProof"),
  (req, res, next) => {
    // Debugging: Cek apakah request masuk ke sini
    console.log("⚡ Request masuk ke Route Cloudinary!");
    next();
  },
  participantController.uploadPaymentProof,
);

// 2. Register Peserta
router.post("/register", participantController.register);

// 3. Cek Status
router.post("/check-status", participantController.getParticipantStatus);

// ... Export ...
module.exports = router;
