// db.js
const mongoose = require("mongoose");

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and prevent multiple connections in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Opsi tambahan untuk kestabilan di trafik tinggi
      maxPoolSize: 10, // Batasi koneksi per instance agar tidak membebani Atlas M0
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log("⏳ Menghubungkan ke MongoDB...");

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log(`✅ MongoDB Terhubung: ${mongoose.connection.host}`);
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`❌ Gagal Konek: ${e.message}`);
    // Jangan gunakan process.exit(1) di serverless, cukup lempar error
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
