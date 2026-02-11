require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit"); // Import rate limiter
const connectDB = require("./config/db");
const path = require("path");

const adminRoutes = require("./routes/adminRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// Hubungkan ke Database
connectDB();

// ==========================================
// 1. RATE LIMITER (KEAMANAN NANO INSTANCE)
// ==========================================

// Limiter umum untuk mencegah serangan DDoS ringan pada RAM Koyeb
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Menit
  max: 200, // Batas 200 request per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan dari koneksi ini. Silakan coba lagi nanti.",
  },
});

// Limiter khusus pendaftaran untuk melindungi kuota Cloudinary & Database
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Jam
  max: 25, // Maksimal 10 kali pendaftaran per IP per jam
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
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`🚫 CORS Blocked for origin: ${origin}`);
        return callback(new Error("CORS policy: Access Denied"), false);
      }
    },
    credentials: true, // Wajib TRUE untuk cookie lintas domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(generalLimiter); // Terapkan limiter umum ke semua route
app.use(cookieParser()); // Parsing cookie sebelum routing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 3. ROUTING
// ==========================================

// Terapkan limiter khusus pendaftaran pada route register (jika ada di apiRoutes)
app.use("/api/register", registerLimiter);

app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send(
    "API Surabaya Heritage Run 2026 - Production Ready with Protection 🏃💨",
  );
});

// ==========================================
// 4. ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR LOG:", err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server.",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `🚀 Server berjalan di mode ${process.env.NODE_ENV || "production"}`,
  );
});
