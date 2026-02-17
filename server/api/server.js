require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
// PENYESUAIAN 1: Path naik satu tingkat (../) karena file ini sekarang di dalam /api
const connectDB = require("../config/db");
const path = require("path");

const adminRoutes = require("../routes/adminRoutes");
const apiRoutes = require("../routes/apiRoutes");

const app = express();

// Hubungkan ke Database
connectDB();

// ==========================================
// 1. RATE LIMITER (KEAMANAN NANO INSTANCE & VERCEL)
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
  max: 25,
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
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
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

// PENYESUAIAN 2: Folder static di Serverless
// Catatan: Vercel tidak bisa menyimpan file permanen di folder /uploads.
// Pastikan upload Anda menggunakan Cloudinary.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// 3. ROUTING
// ==========================================
app.use("/api/register", registerLimiter);
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API Surabaya Heritage Run 2026 - Online & Scalable on Vercel 🏃💨");
});

// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server.",
  });
});

// PENYESUAIAN 3: Kondisi untuk Local vs Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on port ${PORT}`);
  });
}

// WAJIB: Export app untuk Vercel Serverless
module.exports = app;
