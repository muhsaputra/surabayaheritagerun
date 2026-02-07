const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Mengambil link dari file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Terhubung: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Gagal Konek: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
