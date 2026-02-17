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
    const worksheet = workbook.addWorksheet("Database Peserta", {
      views: [{ showGridLines: false }], // UX: Menghilangkan garis kotak-kotak Excel agar seperti Web
    });

    // --- 1. SETUP KOLOM (Mulai dari B untuk efek padding/margin) ---
    // Kolom A dikosongkan untuk margin kiri
    worksheet.columns = [
      { header: "", key: "margin", width: 4 },
      { header: "BIB", key: "bibNumber", width: 12 },
      { header: "NAMA LENGKAP", key: "fullName", width: 35 },
      { header: "KAT", key: "category", width: 10 },
      { header: "SIZE", key: "jerseySize", width: 10 },
      { header: "WHATSAPP", key: "whatsapp", width: 22 },
      { header: "GOL. DARAH", key: "bloodType", width: 15 },
      { header: "KONTAK DARURAT", key: "emergencyContact", width: 25 },
      { header: "STATUS", key: "paymentStatus", width: 18 },
      { header: "FASE", key: "registrationPhase", width: 18 },
      { header: "TANGGAL DAFTAR", key: "createdAt", width: 22 },
    ];

    // --- 2. HEADER BRANDING (Web Style Banner) ---
    const headerColor = "FFDC2626"; // Merah Heritage
    const darkColor = "FF0F172A"; // Biru Tua Dash

    worksheet.mergeCells("B2:K2");
    const banner = worksheet.getCell("B2");
    banner.value = "SURABAYA HERITAGE RUN 2026 - INTERNAL DATABASE";
    banner.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    };
    banner.font = {
      name: "Segoe UI",
      size: 14,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    banner.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 40;

    // --- 3. TABLE HEADER (Modern Dark) ---
    const headerRow = worksheet.getRow(4);
    headerRow.height = 30;

    // Looping untuk style header kolom B sampai K
    for (let i = 2; i <= 11; i++) {
      const cell = headerRow.getCell(i);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: darkColor },
      };
      cell.font = {
        name: "Segoe UI",
        size: 10,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      // Border bawah merah tipis sebagai aksen
      cell.border = {
        bottom: { style: "medium", color: { argb: headerColor } },
      };
    }

    // --- 4. INSERT DATA & STYLING ---
    participants.forEach((p, index) => {
      const rowIndex = index + 5;
      const row = worksheet.getRow(rowIndex);
      row.height = 25;

      const rowData = {
        bibNumber: p.bibNumber || "-",
        fullName: p.fullName.toUpperCase(),
        category: p.category,
        jerseySize: p.jerseySize,
        whatsapp: p.whatsapp,
        bloodType: p.bloodType || "-",
        emergencyContact: p.emergencyContact || "-",
        paymentStatus: p.paymentStatus === "paid" ? "PAID" : "PENDING",
        registrationPhase: p.registrationPhase || "Regular",
        createdAt: new Date(p.createdAt).toLocaleDateString("id-ID"),
      };

      // Isi data mulai dari kolom B
      Object.keys(rowData).forEach((key, colIndex) => {
        const cell = row.getCell(colIndex + 2);
        cell.value = rowData[key];

        // Base Style
        cell.font = { name: "Segoe UI", size: 10, color: { argb: "FF334155" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };

        // Zebra Striping (Soft Slate)
        if (index % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        // --- UX: Custom Styling per Data ---
        // BIB dikasih warna merah tebal
        if (key === "bibNumber") {
          cell.font = { bold: true, color: { argb: headerColor } };
        }

        // Status "Pill" Effect
        if (key === "paymentStatus") {
          if (p.paymentStatus === "paid") {
            cell.font = { bold: true, color: { argb: "FF16A34A" } }; // Hijau
          } else {
            cell.font = { bold: true, color: { argb: "FFEA580C" } }; // Oranye
          }
        }
      });
    });

    // --- 5. BORDER OUTER (Membuat efek kartu/box) ---
    // Menambahkan garis halus di sisi-sisi data
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.getCell(2).border = {
          ...row.getCell(2).border,
          left: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
        row.getCell(11).border = {
          ...row.getCell(11).border,
          right: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
      }
    });

    // Freeze Pane agar header tetap di tempat
    worksheet.views = [
      { state: "frozen", xSplit: 0, ySplit: 4, activeCell: "B5" },
    ];

    // --- 6. EXPORT ---
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SHR2026_Premium_Report.xlsx",
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
