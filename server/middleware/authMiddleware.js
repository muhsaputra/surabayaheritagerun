const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  // --- DEBUG LOG UNTUK PRODUCTION ---
  console.log("🔍 [AUTH CHECK] Origin:", req.headers.origin);
  console.log("🔍 [AUTH CHECK] Cookies received:", req.cookies); // Cek apakah 'token' ada di sini
  console.log(
    "🔍 [AUTH CHECK] Auth Header:",
    req.headers.authorization ? "Present" : "Missing",
  );

  // 1. Cek token di Header Authorization (Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Cek token di Cookie (Solusi Utama Vercel -> Koyeb)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.error("❌ [AUTH ERROR] No token found in request");
    return res.status(401).json({
      success: false,
      message: "Sesi tidak ditemukan. Silakan login kembali.",
    });
  }

  try {
    // Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validasi Ekstra: Pastikan Admin masih ada
    const currentAdmin = await Admin.findById(decoded.id).select("-password");

    if (!currentAdmin) {
      console.error("❌ [AUTH ERROR] Admin not found in DB");
      return res.status(401).json({
        success: false,
        message: "Akun admin tidak terdaftar.",
      });
    }

    req.admin = currentAdmin;
    console.log("✅ [AUTH SUCCESS] Access granted for:", currentAdmin.username);
    next();
  } catch (error) {
    console.error("🔥 [AUTH ERROR] JWT Verification Failed:", error.message);

    // Jika JWT_SECRET di Koyeb berbeda, verifikasi akan selalu gagal di sini
    return res.status(401).json({
      success: false,
      message: "Sesi kadaluwarsa atau tidak valid.",
    });
  }
};

module.exports = { protect };
