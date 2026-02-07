const midtransClient = require("midtrans-client");
const Participant = require("../models/Participant");
const { sendTicketEmail } = require("../utils/emailSender");
const multer = require("multer");
const path = require("path");

// --- 1. KONFIGURASI MULTER (UPLOAD FILE) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Pastikan folder 'uploads' ada di root server
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Format nama file: PROOF-IDPESERTA-TIMESTAMP.jpg
    cb(null, "PROOF-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Validasi hanya boleh gambar
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya boleh upload file gambar!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- 2. FUNGSI-FUNGSI CONTROLLER ---

// A. Create Transaction (Midtrans Token - Opsional jika pakai QRIS Statis)
const createTransaction = async (req, res) => {
  try {
    const { id } = req.body;
    const participant = await Participant.findById(id);
    if (!participant)
      return res.status(404).json({ message: "Peserta tidak ditemukan" });

    let snap = new midtransClient.Snap({
      isProduction: true, // Ubah false jika Sandbox
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const orderId = `RUN-${participant._id}-${Date.now()}`;

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 100, // Hardcode 100 perak untuk testing
      },
      customer_details: {
        first_name: participant.fullName,
        email: participant.email,
        phone: participant.phoneNumber,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// B. Payment Success (Update Status LUNAS & Kirim Email)
const paymentSuccess = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id)
      return res.status(400).json({ message: "Order ID is required" });

    const parts = order_id.split("-");
    const participantId = parts[1];

    const updatedParticipant = await Participant.findByIdAndUpdate(
      participantId,
      { paymentStatus: "paid" },
      { new: true },
    );

    if (!updatedParticipant)
      return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // Kirim Email Tiket
    sendTicketEmail(updatedParticipant);

    res.json({
      success: true,
      message: "Status pembayaran berhasil diupdate & Email sedang dikirim",
      data: updatedParticipant,
    });
  } catch (error) {
    console.log("Error updating payment status:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal update status pembayaran" });
  }
};

// C. Upload Payment Proof (Untuk QRIS Statis Manual)
const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "File tidak ditemukan" });

    // Update DB: Simpan nama file & ubah status jadi 'pending'
    const participant = await Participant.findByIdAndUpdate(
      id,
      {
        paymentProof: file.filename,
        paymentStatus: "pending",
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Bukti bayar berhasil diupload",
      data: participant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal upload bukti bayar" });
  }
};

// --- 3. EXPORTS MODULE (PENTING: Jangan diubah strukturnya) ---
module.exports = {
  createTransaction,
  paymentSuccess,
  uploadPaymentProof,
  uploadMiddleware: upload.single("proof"), // Middleware multer diexport di sini
};
