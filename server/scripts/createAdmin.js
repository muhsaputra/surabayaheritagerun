const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27013/heritage_run",
    );

    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin sudah ada!");
      process.exit();
    }

    const newAdmin = new Admin({
      username: "admin",
      password: "rahasiabersama", // Ganti dengan password yang kuat
    });

    await newAdmin.save();
    console.log("✅ Admin pertama berhasil dibuat!");
    process.exit();
  } catch (error) {
    console.error("Gagal buat admin:", error);
    process.exit(1);
  }
};

createAdmin();
