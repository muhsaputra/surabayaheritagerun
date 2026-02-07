require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// ==========================================
// 1. IMPORT ROUTES
// ==========================================
const adminRoutes = require("./routes/adminRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// 2. Hubungkan Database
connectDB();

// ==========================================
// 3. MIDDLEWARE (UPDATED FOR DEPLOYMENT)
// ==========================================

// Atur CORS agar hanya mengizinkan domain Frontend Anda
const allowedOrigins = [
  "http://localhost:5173", // Development
  process.env.FRONTEND_URL, // URL Vercel (diatur di Railway)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti dari Postman atau server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "CORS policy ini tidak mengizinkan akses dari origin yang Anda gunakan.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder uploads untuk menyimpan bukti pembayaran peserta
// Buat folder "uploads" di root server jika belum ada
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 4. ROUTING UTAMA
// ==========================================

app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API Surabaya Heritage Run 2026 - Production Ready 🏃💨");
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR LOG:", err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server.",
    // Sembunyikan stack trace di production demi keamanan
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ==========================================
// 6. JALANKAN SERVER
// ==========================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `🚀 Server berjalan di mode ${process.env.NODE_ENV || "development"}`,
  );
  console.log(`📡 URL: http://localhost:${PORT}`);
});
