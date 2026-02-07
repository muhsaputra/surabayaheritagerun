const mongoose = require("mongoose");

const EventConfigSchema = new mongoose.Schema({
  // Master Switch: Jika false, pendaftaran tutup total apapun fasenya
  isRegistrationOpen: { type: Boolean, default: true },

  // Index Fase yang Aktif (0 = Presale, 1 = Early Bird, dst.)
  activePhaseIndex: { type: Number, default: 0 },

  // Konfigurasi Fase
  phases: [
    {
      name: { type: String, required: true }, // Contoh: Presale, Early Bird, Regular
      start: { type: Date, required: true },
      end: { type: Date, required: true },

      // Batas Kuota per Kategori
      limits: {
        "5K": { type: Number, default: 0 },
        "3K": { type: Number, default: 0 },
      },

      // 👇 [BARU] Harga Tiket per Kategori (Dinamis per Fase)
      prices: {
        "5K": { type: Number, default: 150000 }, // Default jika tidak diisi
        "3K": { type: Number, default: 125000 }, // Default jika tidak diisi
      },
    },
  ],
});

module.exports = mongoose.model("EventConfig", EventConfigSchema);
