const Participant = require("../models/Participant");
const ActivityLog = require("../models/ActivityLog");
const EventConfig = require("../models/EventConfig");
const { sendTicketEmail } = require("../utils/emailSender");

// --- 1. AMBIL SEMUA PESERTA (Dashboard) ---
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json({ success: true, data: participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. KONFIRMASI PEMBAYARAN & KIRIM TIKET (UPDATED BIB LOGIC) ---
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.body;

    const participantCheck = await Participant.findById(id);
    if (!participantCheck) {
      return res
        .status(404)
        .json({ success: false, message: "Peserta tidak ditemukan" });
    }

    if (participantCheck.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Peserta ini sudah lunas sebelumnya.",
      });
    }

    // ==========================================
    // LOGIKA GENERATE NOMOR BIB OTOMATIS
    // ==========================================

    // 1. Tentukan Angka Awal (Base Number)
    const baseNumber = participantCheck.category === "5K" ? 50100 : 30100;

    // 2. Hitung jumlah peserta yang sudah lunas (status: paid) di kategori yang sama
    const countPaid = await Participant.countDocuments({
      category: participantCheck.category,
      paymentStatus: "paid",
    });

    // 3. Generate BIB: Base Number + jumlah yang sudah ada
    // Contoh: Jika 5K belum ada yang lunas -> 50100 + 0 = 50100
    // Contoh: Jika 3K sudah ada 5 orang lunas -> 30100 + 5 = 30105
    const bibNumber = String(baseNumber + countPaid);

    // 4. Update Status & BIB ke Database
    const participant = await Participant.findByIdAndUpdate(
      id,
      {
        paymentStatus: "paid",
        bibNumber: bibNumber,
      },
      { new: true },
    );

    // ==========================================
    // KIRIM EMAIL TIKET
    // ==========================================
    try {
      // Pastikan sendTicketEmail sudah menggunakan data terbaru
      await sendTicketEmail(participant);
      console.log(
        `📧 Email tiket (#${bibNumber}) terkirim ke ${participant.email}`,
      );
    } catch (emailError) {
      console.error("❌ Gagal kirim email:", emailError);
      // Tetap lanjutkan respon sukses meski email gagal (agar admin tidak bingung)
    }

    res.json({
      success: true,
      bibNumber: bibNumber, // Kirim BIB ke frontend agar admin bisa lihat langsung
      message: `Pembayaran diverifikasi. Nomor BIB: ${bibNumber}`,
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. CHECK-IN PESERTA (SCAN QR) ---
exports.checkIn = async (req, res) => {
  try {
    const { id } = req.body;

    const participantCheck = await Participant.findById(id);
    if (!participantCheck) {
      return res
        .status(404)
        .json({ success: false, message: "Peserta tidak ditemukan" });
    }

    if (participantCheck.paymentStatus !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Peserta BELUM LUNAS!" });
    }

    if (participantCheck.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: "Peserta SUDAH Check-in sebelumnya.",
      });
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
      { isCheckedIn: true, checkInTime: new Date() },
      { new: true },
    );

    res.json({
      success: true,
      message: "Check-in Berhasil!",
      data: participant,
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. AMBIL LOG AKTIVITAS ---
exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil log" });
  }
};

// ==========================================
// PENGATURAN FASE & KUOTA
// ==========================================

// --- 5. AMBIL CONFIG (GET) ---
exports.getConfig = async (req, res) => {
  try {
    let config = await EventConfig.findOne();

    // Jika belum ada (pertama kali run), buat default dengan struktur HARGA
    if (!config) {
      config = await EventConfig.create({
        isRegistrationOpen: true,
        activePhaseIndex: 0,
        phases: [
          {
            name: "Presale",
            start: new Date(),
            end: new Date(),
            limits: { "5K": 100, "3K": 100 },
            prices: { "5K": 100000, "3K": 75000 }, // Default Harga
          },
          {
            name: "Early Bird",
            start: new Date(),
            end: new Date(),
            limits: { "5K": 200, "3K": 200 },
            prices: { "5K": 125000, "3K": 100000 }, // Default Harga
          },
          {
            name: "Regular",
            start: new Date(),
            end: new Date(),
            limits: { "5K": 500, "3K": 500 },
            prices: { "5K": 150000, "3K": 125000 }, // Default Harga
          },
        ],
      });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. UPDATE CONFIG (POST) ---
exports.updateConfig = async (req, res) => {
  try {
    // Menerima phases yang sudah berisi limits & prices dari frontend
    const { isRegistrationOpen, phases, activePhaseIndex } = req.body;

    const config = await EventConfig.findOneAndUpdate(
      {},
      { isRegistrationOpen, phases, activePhaseIndex },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      data: config,
      message: "Pengaturan berhasil disimpan!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. AMBIL STATUS KUOTA (UPDATED: Hitung Per Fase) ---
exports.getStatsCount = async (req, res) => {
  try {
    // Gunakan Aggregation untuk mengelompokkan berdasarkan Fase Pendaftaran & Kategori
    const stats = await Participant.aggregate([
      {
        $group: {
          _id: {
            phase: "$registrationPhase", // Group by kolom 'registrationPhase'
            category: "$category", // Group by kolom 'category'
          },
          count: { $sum: 1 }, // Hitung jumlahnya
        },
      },
    ]);

    // Format ulang data agar mudah dibaca Frontend Admin
    const formattedStats = {};

    stats.forEach((item) => {
      // Handle jika ada data lama yang tidak punya field registrationPhase (kasih "Unknown")
      const phase = item._id.phase || "Unknown";
      const category = item._id.category;

      // Inisialisasi object jika belum ada
      if (!formattedStats[phase]) {
        formattedStats[phase] = { "5K": 0, "3K": 0 };
      }

      // Masukkan jumlah
      formattedStats[phase][category] = item.count;
    });

    res.json({
      success: true,
      data: formattedStats, // Kirim data terstruktur
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
