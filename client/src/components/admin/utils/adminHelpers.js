// src/utils/adminHelpers.js

export const getProofUrl = (path) => {
  if (!path) return null;

  // 1. Jika path sudah berupa URL lengkap (misal: Cloudinary), kembalikan langsung
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  // 2. Jika path adalah file lokal (misal: uploads/bukti-123.jpg)
  // Ganti backslash (\) windows menjadi forward slash (/)
  const cleanPath = path.replace(/\\/g, "/");

  // Pastikan URL Backend sesuai port server Anda (5001)
  return `http://localhost:5001/${cleanPath}`;
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Format YYYY-MM-DD untuk input type="date"
  return date.toISOString().split("T")[0];
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDateID = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
