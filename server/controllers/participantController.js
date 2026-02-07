// controllers/participantController.js

const Participant = require("../models/Participant");
const EventConfig = require("../models/EventConfig");

// ==========================================
// 1. REGISTER PESERTA BARU (Updated: Dynamic Price & Quota)
// ==========================================
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      category,
      jerseySize,
      nik,
      gender,
      birthDate,
      bloodType,
      city,
      province,
      emergencyContact,
      waiverAccepted,
    } = req.body;

    // --- 1. CEK PENGATURAN GLOBAL & FASE ---
    const config = await EventConfig.findOne();

    // A. Cek Master Switch
    if (!config || !config.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message:
          "Mohon maaf, pendaftaran sedang DITUTUP sementara oleh panitia.",
      });
    }

    // B. Ambil Data Fase Aktif
    const activePhase = config.phases[config.activePhaseIndex];
    const phaseName = activePhase.name;
    const limitQuota = activePhase.limits[category];

    // --- 2. CEK KUOTA (HANYA UNTUK FASE INI) ---
    const currentCount = await Participant.countDocuments({
      category: category,
      registrationPhase: phaseName, // Hanya hitung peserta fase ini
    });

    if (currentCount >= limitQuota) {
      return res.status(400).json({
        success: false,
        message: `Kuota kategori ${category} untuk fase ${phaseName} SUDAH PENUH!`,
      });
    }

    // --- 3. LOGIKA HARGA (UPDATED: Ambil dari DB) ---
    // Kita ambil harga dari konfigurasi fase yang aktif saat ini
    let pricePaid = activePhase.prices ? activePhase.prices[category] : 0;

    // Fallback: Jika harga di DB kosong (data lama), pakai default
    if (!pricePaid) {
      pricePaid = category === "5K" ? 150000 : 125000;
    }

    // --- 4. VALIDASI EMAIL DUPLIKAT ---
    const existingUser = await Participant.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar. Silakan cek status pendaftaran Anda.",
      });
    }

    // --- 5. BUAT PESERTA BARU ---
    const participant = await Participant.create({
      fullName,
      email,
      phoneNumber,
      category,
      jerseySize,
      pricePaid, // Harga dinamis tersimpan
      registrationPhase: phaseName,
      status: "pending",
      paymentStatus: "pending",
      // Data Tambahan
      nik,
      gender,
      birthDate,
      bloodType,
      city,
      province,
      emergencyContact,
      waiverAccepted,
    });

    res.status(201).json({
      success: true,
      message:
        "Registrasi berhasil! Slot Anda aman, silakan lakukan pembayaran.",
      data: participant,
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, message: "Server Error saat registrasi" });
  }
};

// ==========================================
// 2. UPLOAD BUKTI BAYAR (Tetap Sama)
// ==========================================
exports.uploadPaymentProof = async (req, res) => {
  try {
    console.log("📥 Menerima request upload...");

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "File gambar gagal diupload. Pastikan format JPG/PNG.",
      });
    }

    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID Peserta tidak ditemukan." });
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
      { paymentProof: req.file.path },
      { new: true },
    );

    if (!participant) {
      return res
        .status(404)
        .json({ success: false, message: "Data peserta tidak ditemukan." });
    }

    console.log("✅ Upload Berhasil:", participant.fullName);
    res.status(200).json({
      success: true,
      message:
        "Bukti pembayaran berhasil dikirim! Mohon tunggu verifikasi admin.",
      data: {
        _id: participant._id,
        fullName: participant.fullName,
        paymentProof: participant.paymentProof,
      },
    });
  } catch (error) {
    console.error("❌ Error Upload:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menyimpan bukti bayar.",
    });
  }
};

// ==========================================
// 3. CEK STATUS PESERTA (Tetap Sama)
// ==========================================
exports.getParticipantStatus = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email wajib diisi" });

    const participant = await Participant.findOne({ email });
    if (!participant)
      return res
        .status(404)
        .json({ success: false, message: "Peserta tidak ditemukan" });

    res.json({ success: true, data: participant });
  } catch (error) {
    console.error("Cek Status Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==========================================
// 4. GET PUBLIC CONFIG (Updated: Kirim Harga ke Frontend)
// ==========================================
exports.getPublicConfig = async (req, res) => {
  try {
    const config = await EventConfig.findOne();

    if (!config) {
      return res.json({
        success: true,
        data: {
          isRegistrationOpen: false,
          message: "Konfigurasi event belum diatur.",
        },
      });
    }

    const activePhase = config.phases[config.activePhaseIndex];

    // Hitung Kuota (Fase Ini Saja)
    const count5K = await Participant.countDocuments({
      category: "5K",
      registrationPhase: activePhase.name,
    });
    const count3K = await Participant.countDocuments({
      category: "3K",
      registrationPhase: activePhase.name,
    });

    const limit5K = activePhase.limits["5K"];
    const limit3K = activePhase.limits["3K"];

    const sisa5K = Math.max(0, limit5K - count5K);
    const sisa3K = Math.max(0, limit3K - count3K);
    const totalSisa = sisa5K + sisa3K;

    const is5KFull = count5K >= limit5K;
    const is3KFull = count3K >= limit3K;

    res.json({
      success: true,
      data: {
        isRegistrationOpen: config.isRegistrationOpen,
        activePhaseName: activePhase.name,
        activePhaseIndex: config.activePhaseIndex,
        phases: config.phases,

        // 👇 KIRIM HARGA AKTIF KE FRONTEND
        activePrices: activePhase.prices || { "5K": 150000, "3K": 125000 },

        status: {
          is5KFull,
          is3KFull,
          isSoldOut: is5KFull && is3KFull,
        },

        remaining: {
          sisa5K,
          sisa3K,
          totalSisa,
        },
      },
    });
  } catch (error) {
    console.error("Get Public Config Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
