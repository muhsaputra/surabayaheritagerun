const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

// --- PERBAIKAN DI SINI ---
AdminSchema.pre("save", async function () {
  // Jika password tidak dimodifikasi, jangan di-hash ulang
  if (!this.isModified("password")) return;

  // Hapus parameter 'next' dan pemanggilan 'next()'
  // karena kita menggunakan fungsi async
  this.password = await bcrypt.hash(this.password, 10);
});

AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
