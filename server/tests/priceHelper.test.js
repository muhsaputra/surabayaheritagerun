// server/tests/priceHelper.test.js
const { getEventPrice } = require("../utils/priceHelper");

describe("Cek Logika Harga Tiket (Hanya 3K & 5K)", () => {
  // ✅ Skenario Positif (Harus Berhasil)

  test("Kategori 5K harganya harus Rp 150.000", () => {
    const harga = getEventPrice("5K");
    expect(harga).toBe(150000);
  });

  test("Kategori 3K harganya harus Rp 100.000", () => {
    const harga = getEventPrice("3K");
    expect(harga).toBe(100000);
  });

  test('Input huruf kecil "3k" harus tetap dikenali sebagai 3K', () => {
    expect(getEventPrice("3k")).toBe(100000);
  });

  // ❌ Skenario Negatif (Harus Error)

  test("Kategori 10K harusnya TIDAK VALID (Error)", () => {
    expect(() => {
      getEventPrice("10K");
    }).toThrow("Kategori tidak valid");
  });

  test("Kategori asal-asalan harus Error", () => {
    expect(() => {
      getEventPrice("Lari Mundur");
    }).toThrow("Kategori tidak valid");
  });
});
