// utils/uploadCloud.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// 1. Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "heritage-run-payments", // Nama folder di Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Batasi format file
    // Opsional: Resize otomatis biar hemat storage & cepat load
    transformation: [{ width: 1000, crop: "limit" }],
  },
});

// 3. Inisialisasi Multer dengan Filter & Limit
const uploadCloud = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
    }
  },
});

module.exports = uploadCloud;
