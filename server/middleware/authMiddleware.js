const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  // --- DEBUG LOG UNTUK PRODUCTION ---
  // Membantu melacak apakah token masuk lewat Header atau Cookie
  console.log("🔍 [AUTH CHECK] Origin:", req.headers.origin);
  console.log("🔍 [AUTH CHECK] Cookies:", req.cookies ? "Received" : "Empty");

  const authHeader = req.headers.authorization;
  console.log(
    "🔍 [AUTH CHECK] Auth Header:",
    authHeader ? "Present" : "Missing",
  );

  // 1. Cek token di Header Authorization (Bearer Token)
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    console.log("🎫 Token detected in Header");
  }
  // 2. Cek token di Cookie (Cadangan jika Header gagal)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("🎫 Token detected in Cookie");
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    console.error("❌ [AUTH ERROR] No token found in request");
    return res.status(401).json({
      success: false,
      message: "Sesi tidak ditemukan. Silakan login kembali.",
    });
  }

  try {
    // Verifikasi Token menggunakan Secret dari Environment Variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validasi Ekstra: Pastikan Admin masih ada di Database
    const currentAdmin = await Admin.findById(decoded.id).select("-password");

    if (!currentAdmin) {
      console.error("❌ [AUTH ERROR] Admin ID not found in database");
      return res.status(401).json({
        success: false,
        message: "Akun admin tidak terdaftar.",
      });
    }

    // Simpan data admin ke objek request
    req.admin = currentAdmin;
    console.log("✅ [AUTH SUCCESS] Access granted for:", currentAdmin.username);
    next();
  } catch (error) {
    console.error("🔥 [AUTH ERROR] JWT Verification Failed:", error.message);

    // Memberikan respon spesifik jika token kadaluwarsa
    const msg =
      error.name === "TokenExpiredError"
        ? "Sesi Anda telah berakhir, silakan login ulang."
        : "Sesi tidak valid.";

    return res.status(401).json({
      success: false,
      message: msg,
    });
  }
};

// Pastikan ekspor menggunakan objek agar sesuai dengan require({ protect }) di routes
module.exports = { protect };
