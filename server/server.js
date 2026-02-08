require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const adminRoutes = require("./routes/adminRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

connectDB();

// ==========================================
// 3. MIDDLEWARE (ENHANCED FOR AUTH & CORS)
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://surabayaheritagerun.vercel.app", // Domain Vercel Anda
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
    credentials: true, // Wajib TRUE agar cookie login bisa terkirim
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware tambahan untuk memastikan cookie diperlakukan dengan benar di lintas domain
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 4. ROUTING
// ==========================================

app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API Surabaya Heritage Run 2026 - Production Ready 🏃💨");
});

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
