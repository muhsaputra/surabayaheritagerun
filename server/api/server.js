require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
// Path tetap naik satu tingkat karena file ini di dalam /api
const connectDB = require("../config/db");
const path = require("path");

const adminRoutes = require("../routes/adminRoutes");
const apiRoutes = require("../routes/apiRoutes");

const app = express();

// Hubungkan ke Database
connectDB();

// ==========================================
// 1. RATE LIMITER (KEAMANAN)
// ==========================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 35, // Dinaikkan sedikit untuk antisipasi pendaftar bersamaan
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Batas pendaftaran tercapai. Silakan coba lagi dalam satu jam.",
  },
});

// ==========================================
// 2. MIDDLEWARE (CORS & AUTH)
// ==========================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://surabayaheritagerun.vercel.app",
  "https://surabayaheritagerun.com",
  "https://www.surabayaheritagerun.com",
  "https://api.surabayaheritagerun.com", // UPDATE: Domain API baru diizinkan
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti aplikasi mobile atau curl) atau yang ada di list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚫 CORS Blocked for origin: ${origin}`);
        callback(new Error("CORS policy: Access Denied"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    optionsSuccessStatus: 204,
  }),
);

app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder static (Hanya untuk akses file yang sudah ada, bukan untuk simpan baru di Vercel)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// 3. ROUTING
// ==========================================
app.use("/api/register", registerLimiter);
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

// Route Utama / Health Check
app.get("/", (req, res) => {
  res
    .status(200)
    .send("API Surabaya Heritage Run 2026 - Online & Scalable on Vercel 🏃💨");
});

// Handling 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route tidak ditemukan." });
});

// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server.",
  });
});

// ==========================================
// 5. EXPORT / LISTEN
// ==========================================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on port ${PORT}`);
    console.log(`🔗 Allowed Origins: ${allowedOrigins.join(", ")}`);
  });
}

// WAJIB: Export app untuk Vercel Serverless
module.exports = app;
