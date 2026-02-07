const ActivityLog = require("../models/ActivityLog");

const createLog = async (action, target, details = "-", req = null) => {
  try {
    // Coba ambil IP Address (jika tersedia)
    let ip = "-";
    if (req) {
      ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }

    // Simpan ke Database
    await ActivityLog.create({
      adminName: "Super Admin",
      action,
      target,
      details,
      ipAddress: ip,
    });

    // Tampilkan di terminal server juga biar enak debug
    console.log(`📝 LOG: [${action}] ${target}`);
  } catch (error) {
    console.error("Gagal mencatat log:", error.message);
    // Kita catch errornya supaya fitur utama TIDAK macet cuma gara-gara log gagal
  }
};

module.exports = { createLog };
