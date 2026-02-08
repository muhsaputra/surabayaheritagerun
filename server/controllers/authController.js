const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

/**
 * @desc    Autentikasi Admin & Mendapatkan Token
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cari admin berdasarkan username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Username tidak ditemukan" });
    }

    // 2. Verifikasi password menggunakan method comparePassword dari model
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    // 3. Buat Token JWT (Berlaku 1 hari)
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Kirim Token via Cookie dengan atribut keamanan tinggi
    // Konfigurasi ini wajib agar cookie bisa berpindah dari domain Koyeb ke Vercel
    res.cookie("token", token, {
      httpOnly: true, // Mencegah akses cookie via JavaScript (aman dari XSS)
      secure: true, // Wajib true untuk HTTPS (Vercel & Koyeb)
      sameSite: "none", // Wajib 'none' agar cookie bisa dikirim lintas domain
      maxAge: 24 * 60 * 60 * 1000, // Durasi 1 hari
    });

    // 5. Kirim respon sukses beserta token dalam body (untuk cadangan localStorage)
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("🔥 Login Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat proses login.",
    });
  }
};
