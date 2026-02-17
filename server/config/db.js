const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Definisikan MONGO_URI di Environment Variables Vercel!");
}

/**
 * Caching koneksi sangat krusial untuk Vercel agar limit 500 koneksi Atlas tidak jebol
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Jika koneksi sudah ada, langsung return
  if (cached.conn) {
    return cached.conn;
  }

  // Jika belum ada proses koneksi, buat promise baru
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Ubah ke TRUE agar Mongoose mengantri query sampai koneksi siap
      maxPoolSize: 10, // Batasi agar efisien di serverless
    };

    console.log("⏳ Menghubungkan ke MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Terhubung");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset jika gagal agar bisa coba lagi
    console.error("❌ Koneksi Gagal:", e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
