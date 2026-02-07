// require("dotenv").config();
// const mongoose = require("mongoose");
// const connectDB = require("./config/db");
// const TicketBatch = require("./models/TicketBatch");

// // Fungsi untuk mengisi data
// const importData = async () => {
//   try {
//     // 1. Hubungkan ke Database
//     await connectDB();

//     // 2. Hapus semua data tiket lama (Biar tidak duplikat kalau dijalankan 2x)
//     await TicketBatch.deleteMany();
//     console.log("🧹 Data tiket lama dihapus...");

//     // 3. Siapkan Data Tanggal (Agar otomatis menyesuaikan hari ini)
//     const today = new Date();

//     // Bulan 1 (Presale): Aktif Sekarang
//     const startPresale = new Date(today);
//     startPresale.setDate(today.getDate() - 1); // Mulai kemarin
//     const endPresale = new Date(today);
//     endPresale.setDate(today.getDate() + 30); // Sampai 30 hari ke depan

//     // Bulan 2 (Early Bird)
//     const startEarly = new Date(endPresale);
//     startEarly.setDate(startEarly.getDate() + 1);
//     const endEarly = new Date(startEarly);
//     endEarly.setDate(endEarly.getDate() + 30);

//     // Bulan 3 (Regular)
//     const startReg = new Date(endEarly);
//     startReg.setDate(startReg.getDate() + 1);
//     const endReg = new Date(startReg);
//     endReg.setDate(endReg.getDate() + 30);

//     // 4. Daftar Tiket Sesuai Permintaan Kamu
//     const batches = [
//       // --- SESI 1: PRESALE (200 Tiket) ---
//       {
//         name: "PRESALE",
//         category: "3K",
//         price: 100000,
//         quotaTotal: 100, // 100 Peserta
//         startDate: startPresale,
//         endDate: endPresale,
//       },
//       {
//         name: "PRESALE",
//         category: "5K",
//         price: 150000,
//         quotaTotal: 100, // 100 Peserta
//         startDate: startPresale,
//         endDate: endPresale,
//       },

//       // --- SESI 2: EARLY BIRD (200 Tiket) ---
//       {
//         name: "EARLY_BIRD",
//         category: "3K",
//         price: 125000,
//         quotaTotal: 100,
//         startDate: startEarly,
//         endDate: endEarly,
//       },
//       {
//         name: "EARLY_BIRD",
//         category: "5K",
//         price: 175000,
//         quotaTotal: 100,
//         startDate: startEarly,
//         endDate: endEarly,
//       },

//       // --- SESI 3: REGULAR (1100 Tiket) ---
//       {
//         name: "REGULAR",
//         category: "3K",
//         price: 150000,
//         quotaTotal: 400,
//         startDate: startReg,
//         endDate: endReg,
//       },
//       {
//         name: "REGULAR",
//         category: "5K",
//         price: 200000,
//         quotaTotal: 700,
//         startDate: startReg,
//         endDate: endReg,
//       },
//     ];

//     // 5. Masukkan ke Database
//     await TicketBatch.insertMany(batches);
//     console.log("✅ BERHASIL! 1.500 Kuota Tiket sudah masuk database.");

//     process.exit();
//   } catch (error) {
//     console.error(`❌ Gagal: ${error}`);
//     process.exit(1);
//   }
// };

require("dotenv").config();
const mongoose = require("mongoose");
const { fakerID_ID: faker } = require("@faker-js/faker");
const Participant = require("./models/Participant");
const connectDB = require("./config/db");

// JUMLAH DATA YANG INGIN DITES
const TOTAL_DATA = 1500;

const importData = async () => {
  try {
    await connectDB();

    console.log("🔥 Menghapus data lama agar bersih...");
    await Participant.deleteMany();

    console.log(`🚀 Memulai proses seeding ${TOTAL_DATA} data...`);

    const participants = [];

    for (let i = 0; i < TOTAL_DATA; i++) {
      // 1. Random Kategori & Harga
      const categories = ["5K", "10K", "Half Marathon"];
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      let price = 150000;
      if (category === "10K") price = 250000;
      if (category === "Half Marathon") price = 450000;

      // 2. Random Status (Payment)
      const statusChance = Math.random();
      let status = "pending";
      let paymentStatus = "pending";
      let bibNumber = undefined;

      // 40% kemungkinan Lunas (Paid)
      if (statusChance > 0.6) {
        status = "paid";
        paymentStatus = "paid";
        bibNumber = 1000 + i;
      }

      // 3. Generate Data
      participants.push({
        fullName: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phoneNumber: faker.phone.number(),
        password: "password123", // Default password

        // --- Data Event ---
        category: category,
        jerseySize: faker.helpers.arrayElement(["S", "M", "L", "XL", "XXL"]),
        pricePaid: price,
        status: status,
        paymentStatus: paymentStatus,
        bibNumber: bibNumber,
        paymentProof: `https://placehold.co/400x600/png?text=Bukti+${i}`,
        registrationDate: faker.date.past(),

        // --- Data Pribadi Lengkap ---
        nik: faker.string.numeric(16),

        // 🔥 FIX DI SINI: Gender harus "Laki-laki" atau "Perempuan"
        gender: faker.helpers.arrayElement(["Laki-laki", "Perempuan"]),

        birthDate: faker.date.birthdate({ min: 17, max: 65, mode: "age" }),
        bloodType: faker.helpers.arrayElement(["A", "B", "AB", "O"]),

        // --- Alamat ---
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        province: faker.location.state(),
        postalCode: faker.location.zipCode(),

        // --- Kontak Darurat ---
        emergencyContact: {
          name: faker.person.fullName(),
          relation: faker.helpers.arrayElement([
            "Orang Tua",
            "Pasangan",
            "Saudara",
            "Teman",
          ]),
          phone: faker.phone.number(),
        },

        waiverAccepted: true,
      });

      // Log progres
      if ((i + 1) % 500 === 0) {
        console.log(`   ... ${i + 1} data siap.`);
      }
    }

    // Insert ke Database
    await Participant.insertMany(participants);

    console.log(
      `✅ SUKSES! Database sekarang berisi ${TOTAL_DATA} data peserta VALID.`,
    );
    process.exit();
  } catch (error) {
    console.error("❌ Gagal Seeding:", error.message);
    if (error.errors) {
      // Tampilkan error spesifik jika masih ada yang salah
      const errorDetails = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      console.error("Detail Validasi:", errorDetails);
    }
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  const destroyData = async () => {
    try {
      await connectDB();
      await Participant.deleteMany();
      console.log("✅ Data berhasil dikosongkan.");
      process.exit();
    } catch (error) {
      console.error("❌ Gagal Hapus:", error);
      process.exit(1);
    }
  };
  destroyData();
} else {
  importData();
}
