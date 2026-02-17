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
      views: [{ showGridLines: false }],
    });

    // --- 1. DEFINISI KOLOM (Tetap dimulai dari kolom B untuk padding) ---
    worksheet.columns = [
      { header: "", key: "margin", width: 4 },
      { header: "BIB", key: "bibNumber", width: 12 },
      { header: "NAMA LENGKAP", key: "fullName", width: 35 },
      { header: "KAT", key: "category", width: 10 },
      { header: "SIZE", key: "jerseySize", width: 15 },
      { header: "WHATSAPP", key: "whatsapp", width: 22 },
      { header: "GOL. DARAH", key: "bloodType", width: 15 },
      { header: "NAMA KONTAK DARURAT", key: "emergencyName", width: 25 },
      { header: "TELP KONTAK DARURAT", key: "emergencyPhone", width: 22 },
      { header: "STATUS", key: "paymentStatus", width: 18 },
      { header: "FASE", key: "registrationPhase", width: 18 },
      { header: "TANGGAL DAFTAR", key: "createdAt", width: 22 },
    ];

    // --- 2. BANNER BRANDING (Baris 1) ---
    worksheet.mergeCells("B1:L1");
    const banner = worksheet.getCell("B1");
    banner.value = "SURABAYA HERITAGE RUN 2026 - INTERNAL DATABASE";
    banner.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDC2626" },
    };
    banner.font = {
      name: "Segoe UI",
      size: 14,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    banner.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 40;

    // --- 3. HEADER TABEL (Baris 2) ---
    // Kita paksa teks header muncul di baris 2 dengan warna Biru Tua
    const headerRow = worksheet.getRow(2);
    headerRow.height = 30;

    // Looping untuk memberi warna dan memastikan teks (BIB, Nama, dll) muncul
    const columns = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(col);
      // Mengambil teks header dari definisi worksheet.columns
      cell.value = worksheet.columns[index + 1].header;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      cell.font = {
        name: "Segoe UI",
        size: 10,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FFDC2626" } },
      };
    });

    // --- 4. INSERT DATA ---
    participants.forEach((p, index) => {
      const rowIndex = index + 3;
      const row = worksheet.getRow(rowIndex);
      row.height = 25;

      // --- LOGIKA PENGAMBILAN WHATSAPP (FIX KOSONG) ---
      // Kode ini mengecek p.whatsapp, jika kosong cek p.phone, jika kosong cek p.phoneNumber
      const waNumber = p.whatsapp || p.phone || p.phoneNumber || "-";

      // Parsing Emergency Contact
      let eName = "-";
      let ePhone = "-";
      if (p.emergencyContact) {
        eName = p.emergencyContact.name || p.emergencyContact;
        ePhone = p.emergencyContact.phone || p.emergencyContact.whatsapp || "-";
      }

      const rowData = {
        margin: "",
        bibNumber: p.bibNumber || "-",
        fullName: p.fullName ? p.fullName.toUpperCase() : "-",
        category: p.category || "-",
        jerseySize: p.jerseySize || "-",
        whatsapp: waNumber, // Menggunakan variabel waNumber yang sudah divalidasi
        bloodType: p.bloodType || "-",
        emergencyName: eName,
        emergencyPhone: ePhone,
        paymentStatus: p.paymentStatus === "paid" ? "PAID" : "PENDING",
        registrationPhase: p.registrationPhase || "Regular",
        createdAt: new Date(p.createdAt).toLocaleDateString("id-ID"),
      };

      row.values = Object.values(rowData);

      // --- STYLING BARIS ---
      row.eachCell((cell, colNumber) => {
        if (colNumber >= 2) {
          cell.font = {
            name: "Segoe UI",
            size: 10,
            color: { argb: "FF334155" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };

          // Pastikan kolom WhatsApp dan Kontak Darurat dianggap TEXT agar nomor tidak rusak
          // Kolom F (6) adalah WhatsApp, Kolom I (9) adalah Emergency Phone
          if (colNumber === 6 || colNumber === 9) {
            cell.numFmt = "@";
          }

          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };
          }
          if (colNumber === 2)
            cell.font = { bold: true, color: { argb: "FFDC2626" } };
          if (colNumber === 10) {
            cell.font = {
              bold: true,
              color: {
                argb: p.paymentStatus === "paid" ? "FF16A34A" : "FFEA580C",
              },
            };
          }
        }
      });
    });

    // Freeze Pane agar Banner dan Header tetap diam saat di-scroll
    worksheet.views = [
      { state: "frozen", xSplit: 0, ySplit: 2, activeCell: "B3" },
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
