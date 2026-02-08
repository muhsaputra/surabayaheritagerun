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
// 3. MIDDLEWARE (FIXED FOR CORS ERROR)
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://surabayaheritagerun.vercel.app", // Domain utama Vercel Anda
  process.env.FRONTEND_URL, // Tetap gunakan variabel environment
].filter(Boolean); // Menghapus nilai null/undefined jika FRONTEND_URL belum diatur

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti Postman)
      if (!origin) return callback(null, true);

      // Cek apakah origin ada di daftar allowedOrigins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`🚫 CORS Blocked for origin: ${origin}`);
        const msg =
          "CORS policy ini tidak mengizinkan akses dari origin tersebut.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
