const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Import model Admin untuk validasi ekstra

const protect = async (req, res, next) => {
  let token;

  // 1. Cek token di Header Authorization (Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Cek token di Cookie (Solusi Utama untuk Vercel -> Koyeb)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Akses ditolak, token tidak ditemukan",
      });
  }

  try {
    // Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Validasi Ekstra: Pastikan Admin masih ada di Database
    const currentAdmin = await Admin.findById(decoded.id).select("-password");

    if (!currentAdmin) {
      return res.status(401).json({
        success: false,
        message: "Admin pemilik token ini sudah tidak terdaftar",
      });
    }

    // Simpan data admin ke objek request agar bisa digunakan di controller lain
    req.admin = currentAdmin;
    next();
  } catch (error) {
    console.error("🔥 Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({
        success: false,
        message: "Sesi tidak valid atau telah kadaluwarsa",
      });
  }
};

module.exports = { protect };
