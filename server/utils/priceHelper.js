// server/utils/priceHelper.js

const getEventPrice = (category) => {
  // Normalisasi input biar tidak case-sensitive (misal: "3k" tetap terbaca "3K")
  const cat = category.toUpperCase();

  if (cat === "5K") {
    return 150000;
  } else if (cat === "3K") {
    return 100000;
  } else {
    // Jika ada yang input "10K" atau "Half Marathon", sistem akan menolak
    throw new Error("Kategori tidak valid. Hanya tersedia 3K dan 5K.");
  }
};

module.exports = { getEventPrice };
