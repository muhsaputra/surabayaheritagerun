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
    const worksheet = workbook.addWorksheet("Database Peserta");

    // --- 1. SET HEADER BRANDING (Dibuat Lebih Mewah) ---
    worksheet.mergeCells("A1:L1");
    const mainTitle = worksheet.getCell("A1");
    mainTitle.value = "OFFICIAL DATABASE: SURABAYA HERITAGE RUN 2026";
    mainTitle.font = {
      name: "Segoe UI",
      size: 18,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    mainTitle.alignment = { vertical: "middle", horizontal: "center" };
    mainTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    };

    worksheet.mergeCells("A2:L2");
    const subTitle = worksheet.getCell("A2");
    subTitle.value = `Laporan Real-time Pendaftaran | Dicetak pada: ${new Date().toLocaleString("id-ID")}`;
    subTitle.font = { name: "Segoe UI", size: 10, italic: true };
    subTitle.alignment = { vertical: "middle", horizontal: "center" };

    // --- 2. DEFINISI STRUKTUR KOLOM & LEBAR ---
    worksheet.columns = [
      { header: "BIB", key: "bibNumber", width: 12 },
      { header: "NAMA LENGKAP", key: "fullName", width: 35 },
      { header: "KATEGORI", key: "category", width: 15 },
      { header: "UKURAN", key: "jerseySize", width: 10 },
      { header: "WHATSAPP", key: "whatsapp", width: 20 },
      { header: "EMAIL", key: "email", width: 35 },
      { header: "GENDER", key: "gender", width: 12 },
      { header: "GOL. DARAH", key: "bloodType", width: 12 },
      { header: "KONTAK DARURAT", key: "emergencyContact", width: 25 },
      { header: "STATUS", key: "paymentStatus", width: 15 },
      { header: "FASE", key: "registrationPhase", width: 15 },
      { header: "WAKTU DAFTAR", key: "createdAt", width: 25 },
    ];

    // --- 3. STYLING HEADER TABEL (UX: Sticky & Bold) ---
    const headerRow = worksheet.getRow(3);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 11,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "medium", color: { argb: "FFDC2626" } },
        bottom: { style: "medium" },
      };
    });

    // --- 4. INSERT DATA & ROW STYLING ---
    participants.forEach((p, index) => {
      const row = worksheet.addRow({
        bibNumber: p.bibNumber || "---",
        fullName: p.fullName.toUpperCase(),
        category: p.category,
        jerseySize: p.jerseySize,
        whatsapp: p.whatsapp,
        email: p.email,
        gender: p.gender || "-",
        bloodType: p.bloodType || "-",
        emergencyContact: p.emergencyContact || "-",
        paymentStatus: p.paymentStatus === "paid" ? "✅ LUNAS" : "⏳ PENDING",
        registrationPhase: p.registrationPhase || "Regular",
        createdAt: new Date(p.createdAt).toLocaleString("id-ID"),
      });

      row.height = 20;

      // UX: Zebra Crossing (Warna baris selang-seling agar tidak pusing membacanya)
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        });
      }

      // Styling Alignment per kolom
      row.getCell("bibNumber").alignment = { horizontal: "center" };
      row.getCell("category").alignment = { horizontal: "center" };
      row.getCell("jerseySize").alignment = { horizontal: "center" };
      row.getCell("gender").alignment = { horizontal: "center" };
      row.getCell("bloodType").alignment = { horizontal: "center" };
      row.getCell("paymentStatus").alignment = { horizontal: "center" };

      // Tambahkan Border Tipis di setiap sel data
      row.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10 };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // --- 5. FINISHING ---
    // Freeze Panes (Header tetap terlihat meski scroll ke bawah)
    worksheet.views = [
      { state: "frozen", xSplit: 0, ySplit: 3, activeCell: "A4" },
    ];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Database_Peserta_SHR2026.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Error:", error);
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
