const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema(
  {
    // --- 1. DATA PRIBADI (SESUAI KTP) ---
    fullName: { type: String, required: true },
    nik: { type: String, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    birthDate: { type: Date, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // Nomor WA
    email: { type: String, lowercase: true, required: true },

    // --- 2. DATA SISTEM & EVENT (CRITICAL) ---
    bibNumber: { type: String }, // Nomor Dada (String agar bisa format "50001")
    category: { type: String, required: true }, // "5K" atau "3K"

    // 👇 [PENTING] UNTUK MEMISAHKAN KUOTA PER FASE
    registrationPhase: { type: String, required: true }, // Contoh: "Presale", "Early Bird", "Regular"

    // --- 3. KESEHATAN & KEAMANAN ---
    medicalHistory: {
      type: String,
      default: "Tidak Ada",
    },
    bloodType: {
      type: String,
      enum: ["A", "B", "AB", "O", "Tidak Tahu"],
      default: "Tidak Tahu",
    },
    // Struktur Object Kontak Darurat
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true }, // Hubungan (Ayah/Ibu/dll)
    },
    waiverAccepted: { type: Boolean, required: true },

    // --- 4. LOGISTIK ---
    jerseySize: { type: String, required: true },
    bibName: { type: String, maxlength: 12 },
    infoSource: { type: String },

    // --- 5. PEMBAYARAN ---
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "expired"],
      default: "pending", // Default pending saat register
    },
    paymentProof: { type: String }, // Path/URL gambar bukti bayar
    pricePaid: { type: Number, required: true }, // Harga saat mendaftar (bisa beda tiap fase)

    // --- 6. CHECK-IN ---
    qrCodeToken: { type: String },
    isCheckedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Participant", ParticipantSchema);
