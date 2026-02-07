const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  // Nama Sesi: PRESALE / EARLY_BIRD / REGULAR
  name: {
    type: String,
    enum: ["PRESALE", "EARLY_BIRD", "REGULAR"],
    required: true,
  },
  // Kategori Lari: 3K / 5K
  category: {
    type: String,
    enum: ["3K", "5K"],
    required: true,
  },
  price: { type: Number, required: true }, // Harga tiket
  quotaTotal: { type: Number, required: true }, // Kapasitas Maksimal
  quotaSold: { type: Number, default: 0 }, // Yang sudah laku (mulai dari 0)

  // Tanggal Mulai & Selesai Sesi
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  isActive: { type: Boolean, default: true },
});

// Mencegah duplikasi (Misal: tidak boleh ada 2 Presale 3K sekaligus)
BatchSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("TicketBatch", BatchSchema);
