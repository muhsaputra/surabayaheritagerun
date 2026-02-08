const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Username tidak ditemukan" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    // 1. Buat Token JWT
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 2. Kirim Token via Cookie (Wajib untuk Vercel -> Koyeb)
    res.cookie("token", token, {
      httpOnly: true, // Melindungi dari XSS
      secure: true, // Wajib true karena HTTPS (Koyeb & Vercel)
      sameSite: "none", // Wajib 'none' agar cookie bisa dikirim lintas domain
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // 3. Tetap kirim JSON sebagai cadangan (Opsional)
    res.json({
      success: true,
      token,
      admin: { username: admin.username, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
