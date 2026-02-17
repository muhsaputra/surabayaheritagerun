const Participant = require("../models/Participant");
const ActivityLog = require("../models/ActivityLog");
const EventConfig = require("../models/EventConfig");
const { sendTicketEmail } = require("../utils/emailSender");
const ExcelJS = require("exceljs");

// --- 1. AMBIL SEMUA PESERTA (Dashboard) ---
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json({ success: true, data: participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. KONFIRMASI PEMBAYARAN & KIRIM TIKET ---
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

    // --- LOGIKA GENERATE NOMOR BIB OTOMATIS ---
    const baseNumber = participantCheck.category === "5K" ? 50100 : 30100;
    const countPaid = await Participant.countDocuments({
      category: participantCheck.category,
      paymentStatus: "paid",
    });

    const bibNumber = String(baseNumber + countPaid);

    const participant = await Participant.findByIdAndUpdate(
      id,
      { paymentStatus: "paid", bibNumber: bibNumber },
      { new: true },
    );

    // --- KIRIM EMAIL TIKET ---
    try {
      await sendTicketEmail(participant);
      console.log(
        `📧 Email tiket (#${bibNumber}) terkirim ke ${participant.email}`,
      );
    } catch (emailError) {
      console.error("❌ Gagal kirim email:", emailError);
    }

    res.json({
      success: true,
      bibNumber: bibNumber,
      message: `Pembayaran diverifikasi. Nomor BIB: ${bibNumber}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. EXPORT EXCEL DENGAN BRANDING ---
exports.exportExcel = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daftar Peserta");

    // 1. BRANDING HEADER
    worksheet.mergeCells("A1:L1");
    const titleRow = worksheet.getRow(1);
    titleRow.values = ["DAFTAR PESERTA SURABAYA HERITAGE RUN 2026"];
    titleRow.font = {
      name: "Arial Black",
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    titleRow.alignment = { vertical: "middle", horizontal: "center" };
    titleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    }; // Merah Heritage
    titleRow.height = 35;

    worksheet.mergeCells("A2:L2");
    const subTitleRow = worksheet.getRow(2);
    subTitleRow.values = [`Data Ekspor: ${new Date().toLocaleString("id-ID")}`];
    subTitleRow.font = { italic: true, size: 10 };
    subTitleRow.alignment = { horizontal: "center" };

    // 2. DEFINISI KOLOM
    worksheet.columns = [
      { header: "BIB", key: "bibNumber", width: 12 },
      { header: "Nama Lengkap", key: "fullName", width: 30 },
      { header: "Kategori", key: "category", width: 12 },
      { header: "Jersey", key: "jerseySize", width: 10 },
      { header: "Email", key: "email", width: 30 },
      { header: "No. WhatsApp", key: "whatsapp", width: 20 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Gol. Darah", key: "bloodType", width: 12 },
      { header: "Kontak Darurat", key: "emergencyContact", width: 20 },
      { header: "Fase", key: "registrationPhase", width: 15 },
      { header: "Status", key: "paymentStatus", width: 12 },
      { header: "Waktu Daftar", key: "createdAt", width: 25 },
    ];

    // 3. STYLING HEADER TABEL
    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      }; // Biru Tua
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 4. INSERT DATA
    participants.forEach((p) => {
      const row = worksheet.addRow({
        bibNumber: p.bibNumber || "PENDING",
        fullName: p.fullName,
        category: p.category,
        jerseySize: p.jerseySize,
        email: p.email,
        whatsapp: p.whatsapp,
        gender: p.gender || "-",
        bloodType: p.bloodType || "-",
        emergencyContact: p.emergencyContact || "-",
        registrationPhase: p.registrationPhase || "Regular",
        paymentStatus: p.paymentStatus === "paid" ? "LUNAS" : "BELUM BAYAR",
        createdAt: new Date(p.createdAt).toLocaleString("id-ID"),
      });

      // Zebra striping & border
      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        cell.alignment = { vertical: "middle" };
      });
    });

    // 5. SEND TO CLIENT
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Data_Peserta_SHR2026.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. CHECK-IN PESERTA (SCAN QR) ---
exports.checkIn = async (req, res) => {
  try {
    const { id } = req.body;
    const participantCheck = await Participant.findById(id);

    if (!participantCheck)
      return res
        .status(404)
        .json({ success: false, message: "Peserta tidak ditemukan" });
    if (participantCheck.paymentStatus !== "paid")
      return res
        .status(400)
        .json({ success: false, message: "Peserta BELUM LUNAS!" });
    if (participantCheck.isCheckedIn)
      return res.status(400).json({
        success: false,
        message: "Peserta SUDAH Check-in sebelumnya.",
      });

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. LOGS & CONFIG (GET/UPDATE) ---
exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil log" });
  }
};

exports.getConfig = async (req, res) => {
  try {
    let config = await EventConfig.findOne();
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
            prices: { "5K": 100000, "3K": 75000 },
          },
          {
            name: "Early Bird",
            start: new Date(),
            end: new Date(),
            limits: { "5K": 200, "3K": 200 },
            prices: { "5K": 125000, "3K": 100000 },
          },
          {
            name: "Regular",
            start: new Date(),
            end: new Date(),
            limits: { "5K": 500, "3K": 500 },
            prices: { "5K": 150000, "3K": 125000 },
          },
        ],
      });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
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

// --- 6. STATS COUNT (PER FASE) ---
exports.getStatsCount = async (req, res) => {
  try {
    const stats = await Participant.aggregate([
      {
        $group: {
          _id: { phase: "$registrationPhase", category: "$category" },
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {};
    stats.forEach((item) => {
      const phase = item._id.phase || "Unknown";
      const category = item._id.category;
      if (!formattedStats[phase]) formattedStats[phase] = { "5K": 0, "3K": 0 };
      formattedStats[phase][category] = item.count;
    });

    res.json({ success: true, data: formattedStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
