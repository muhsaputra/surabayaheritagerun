const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      default: "Super Admin", // Karena Anda single admin
      required: true,
    },
    action: {
      type: String, // Contoh: "VERIFY_PAYMENT", "CHECK_IN"
      required: true,
    },
    target: {
      type: String, // Contoh: "Budi Santoso (BIB 101)"
      required: true,
    },
    details: {
      type: String, // Contoh: "Nominal Rp 150.000"
    },
    ipAddress: {
      type: String, // Menyimpan IP Address admin
      default: "-",
    },
  },
  { timestamps: true },
); // Otomatis mencatat createdAt (Waktu kejadian)

module.exports = mongoose.model("ActivityLog", activityLogSchema);
