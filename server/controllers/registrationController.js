const Participant = require("../models/Participant");
const EventConfig = require("../models/EventConfig");
const { sendTicketEmail } = require("../utils/emailSender");

// --- HELPER: AMBIL KONFIGURASI DARI DB ---
const getConfig = async () => {
  let config = await EventConfig.findOne();
  // Jika belum ada di DB (pertama kali run), buat default
  if (!config) {
    config = await EventConfig.create({
      isRegistrationOpen: true,
      phases: [
        {
          name: "Presale",
          start: new Date("2026-02-23T00:00:00"),
          end: new Date("2026-02-27T23:59:59"),
          limits: { "3K": 100, "5K": 100 },
        },
        {
          name: "Early Bird",
          start: new Date("2026-03-02T00:00:00"),
          end: new Date("2026-03-09T23:59:59"),
          limits: { "3K": 100, "5K": 100 },
        },
        {
          name: "Regular",
          start: new Date("2026-03-16T00:00:00"),
          end: new Date("2026-04-19T23:59:59"),
          limits: { "3K": 400, "5K": 700 },
        },
      ],
    });
  }
  return config;
};

// 1. GET CONFIG (Untuk Admin Dashboard)
exports.getEventConfig = async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. UPDATE CONFIG (Untuk Admin Dashboard - Save Settings)
exports.updateEventConfig = async (req, res) => {
  try {
    const { isRegistrationOpen, phases } = req.body;

    // Update data (ambil ID dari config yang ada)
    const config = await getConfig();
    config.isRegistrationOpen = isRegistrationOpen;
    config.phases = phases;
    await config.save();

    res.json({
      success: true,
      message: "Pengaturan berhasil disimpan!",
      data: config,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. CEK STATUS (Untuk Frontend User - Halaman Depan)
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const config = await getConfig();

    // Cek Master Switch
    if (!config.isRegistrationOpen) {
      return res.json({
        isOpen: false,
        message: "Pendaftaran ditutup sementara oleh panitia.",
      });
    }

    const now = new Date();
    // Cari fase yang aktif berdasarkan tanggal
    const currentPhase = config.phases.find(
      (p) => now >= new Date(p.start) && now <= new Date(p.end),
    );

    if (!currentPhase) {
      return res.json({
        isOpen: false,
        message: "Tidak ada fase pendaftaran yang aktif saat ini.",
      });
    }

    // Hitung Kuota Realtime
    const count3K = await Participant.countDocuments({
      category: "3K",
      createdAt: { $gte: currentPhase.start, $lte: currentPhase.end },
    });

    const count5K = await Participant.countDocuments({
      category: "5K",
      createdAt: { $gte: currentPhase.start, $lte: currentPhase.end },
    });

    res.json({
      isOpen: true,
      phase: currentPhase.name,
      status3K: count3K >= currentPhase.limits["3K"] ? "FULL" : "AVAILABLE",
      status5K: count5K >= currentPhase.limits["5K"] ? "FULL" : "AVAILABLE",
      // Gunakan Math.max agar tidak minus
      remaining3K: Math.max(0, currentPhase.limits["3K"] - count3K),
      remaining5K: Math.max(0, currentPhase.limits["5K"] - count5K),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. REGISTER (Dengan Validasi DB)
exports.register = async (req, res) => {
  try {
    const config = await getConfig();

    // Validasi Master Switch
    if (!config.isRegistrationOpen) {
      return res
        .status(400)
        .json({ success: false, message: "Pendaftaran sedang ditutup." });
    }

    const now = new Date();
    const currentPhase = config.phases.find(
      (p) => now >= new Date(p.start) && now <= new Date(p.end),
    );

    // Validasi Tanggal
    if (!currentPhase) {
      return res
        .status(400)
        .json({ success: false, message: "Diluar jadwal pendaftaran." });
    }

    const category = req.body.category; // "3K" atau "5K"

    // Validasi Kuota
    const currentCount = await Participant.countDocuments({
      category: category,
      createdAt: { $gte: currentPhase.start, $lte: currentPhase.end },
    });

    if (currentCount >= currentPhase.limits[category]) {
      return res
        .status(400)
        .json({ success: false, message: `Kuota ${category} sudah penuh!` });
    }

    // Simpan Peserta
    const newParticipant = await Participant.create(req.body);
    res.status(201).json({ success: true, data: newParticipant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. AMBIL DATA PESERTA (Admin)
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json({ success: true, data: participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. CHECK-IN PESERTA (Admin - Saat Hari H)
exports.checkInParticipant = async (req, res) => {
  try {
    const { id } = req.body;
    const participant = await Participant.findByIdAndUpdate(
      id,
      { isCheckedIn: true },
      { new: true },
    );
    res.json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. VERIFIKASI PEMBAYARAN MANUAL (Admin - Klik Tombol Biru)
// --- UPDATE: MANUAL PAYMENT CONFIRM (Fitur No. 3 - Generate BIB) ---
exports.manualPaymentConfirm = async (req, res) => {
  try {
    const { id } = req.body;

    // 1. Ambil data peserta dulu
    let participant = await Participant.findById(id);
    if (!participant)
      return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // 2. LOGIKA GENERATE NOMOR BIB (Hanya jika belum punya BIB)
    if (!participant.bibNumber) {
      let startNumber = 0;

      // Tentukan start number berdasarkan kategori
      if (participant.category === "5K") startNumber = 50000;
      else if (participant.category === "3K") startNumber = 30000;

      // Cari nomor BIB terakhir di kategori tersebut
      const lastParticipant = await Participant.findOne({
        category: participant.category,
        bibNumber: { $exists: true },
      }).sort({ bibNumber: -1 }); // Urutkan dari yang terbesar

      // Jika ada, tambah 1. Jika belum ada, mulai dari startNumber + 1
      const newBib =
        lastParticipant && lastParticipant.bibNumber
          ? lastParticipant.bibNumber + 1
          : startNumber + 1;

      participant.bibNumber = newBib;
    }

    // 3. Update Status jadi PAID & Simpan BIB
    participant.paymentStatus = "paid";
    await participant.save();

    // 4. Kirim Email
    try {
      console.log(`Mengirim email tiket ke: ${participant.email}...`);
      await sendTicketEmail(participant);
    } catch (emailError) {
      console.error("Gagal kirim email:", emailError);
    }

    res.json({
      success: true,
      message: `Pembayaran dikonfirmasi. BIB: ${participant.bibNumber}`,
      data: participant,
    });
  } catch (error) {
    console.error("Error verifikasi:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- FUNGSI BARU: CEK STATUS PESERTA (Fitur No. 2) ---
exports.getParticipantStatus = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email wajib diisi" });
    }

    // BERSIHKAN INPUT: Trim spasi & lowercase
    email = email.trim().toLowerCase();

    // Cari berdasarkan email (case insensitive with regex for robustness)
    const participant = await Participant.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });

    if (!participant) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak ditemukan." });
    }

    res.json({
      success: true,
      data: {
        _id: participant._id, // Added ID for QR Code generation in frontend
        fullName: participant.fullName,
        category: participant.category,
        paymentStatus: participant.paymentStatus,
        bibNumber: participant.bibNumber || "-",
        jerseySize: participant.jerseySize,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
