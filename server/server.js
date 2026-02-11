require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
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

// Konfigurasi CORS yang lebih eksplisit untuk menangani Pre-flight (OPTIONS)
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
    optionsSuccessStatus: 204, // Penting untuk kompabilitas browser lama/mobile
  }),
);

app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 3. ROUTING
// ==========================================
app.use("/api/register", registerLimiter);
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API Surabaya Heritage Run 2026 - Online 🏃💨");
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

const PORT = process.env.PORT || 8000; // Koyeb biasanya menyukai port 8000 atau 8080
app.listen(PORT, "0.0.0.0", () => {
  // "0.0.0.0" wajib agar bisa diakses dari luar Koyeb
  console.log(`🚀 Server running on port ${PORT}`);
});
