const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
require("dotenv").config();

// --- KONFIGURASI TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILSENDER,
    pass: process.env.PASSWORDSENDER,
  },
  // Optimasi pool agar pengiriman massal pada 23 Feb tidak kena limit
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

exports.sendTicketEmail = async (participant) => {
  try {
    // 1. Generate QR Code - High Quality & High Contrast
    const qrCodeDataURL = await QRCode.toDataURL(participant._id.toString(), {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 600, // Ukuran lebih besar agar tajam di layar HP
      color: {
        dark: "#1B4D3E", // Menggunakan Emerald Green gelap (Identitas Heritage)
        light: "#FFFFFF",
      },
    });
    const base64Data = qrCodeDataURL.split(",")[1];

    const eventDayDate = "Minggu, 24 Mei 2026";
    const flagOffTime = "06.00 WIB";
    const venueName = "Plaza Internatio";
    const startFinishLocation = "Jl. Garuda, Surabaya";

    // 2. TEMPLATE HTML (UPGRADED HERITAGE RED)
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;700;900&display=swap');
          /* CSS Styles updated to use Heritage Maroon & Gold */
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Inter', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB;">
          
          <div style="background-color: #450a0a; padding: 40px 20px; text-align: center; border-bottom: 6px solid #D4AF37;">
            <h1 style="margin: 0; color: #ffffff; font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 2px;">SURABAYA <span style="color: #D4AF37;">HERITAGE</span> RUN</h1>
            <p style="margin: 8px 0 0; color: #D4AF37; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: bold;">Official E-Ticket 2026</p>
          </div>

          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 35px;">
              <h2 style="color: #1B4D3E; margin: 0; font-family: 'Playfair Display', serif; font-size: 26px;">Halo, ${participant.fullName}!</h2>
              <div style="display: inline-block; background-color: #F0FDF4; color: #16A34A; padding: 8px 18px; border-radius: 99px; font-size: 11px; font-weight: 800; margin-top: 15px; border: 1px solid #BBF7D0;">PEMBAYARAN TERVERIFIKASI</div>
            </div>

            <div style="border: 2px solid #F3F4F6; border-radius: 20px; overflow: hidden;">
              <div style="background-color: #F9FAFB; padding: 25px; border-bottom: 2px dashed #E5E7EB;">
                <table width="100%">
                  <tr>
                    <td>
                        <p style="font-size: 10px; color: #6B7280; font-weight: bold; margin: 0; text-transform: uppercase;">Kategori Lari</p>
                        <p style="font-size: 20px; color: #9B1B1B; font-weight: 900; margin: 4px 0 0;">${participant.category} RUN</p>
                    </td>
                    <td align="right">
                        <p style="font-size: 10px; color: #6B7280; font-weight: bold; margin: 0; text-transform: uppercase;">Nomor BIB</p>
                        <p style="font-size: 32px; color: #1B4D3E; font-weight: 900; margin: 4px 0 0;">#${participant.bibNumber}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding: 25px;">
                <table width="100%" style="font-size: 13px;">
                  <tr>
                    <td style="padding-bottom: 20px;">
                        <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase;">Waktu Start</span>
                        <span style="font-weight: 700; color: #1F2937;">${eventDayDate} | ${flagOffTime}</span>
                    </td>
                    <td style="padding-bottom: 20px;">
                        <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase;">Lokasi</span>
                        <span style="font-weight: 700; color: #1F2937;">${venueName}</span>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; padding-top: 20px;">
                  <div style="display: inline-block; padding: 15px; border: 2px solid #1B4D3E; border-radius: 20px; background: #ffffff;">
                    <img src="cid:qrcode_ticket" width="220" height="220" style="display: block;" />
                  </div>
                  <p style="margin-top: 20px; font-weight: 900; color: #1B4D3E; font-size: 14px; letter-spacing: 1px;">SCAN QR UNTUK RACE PACK</p>
                </div>
              </div>
            </div>
          </div>

          <div style="background-color: #0F172A; padding: 35px 30px; text-align: center;">
            <p style="color: #ffffff; font-size: 12px; margin: 0 0 10px; font-weight: bold;">Surabaya Heritage Run 2026</p>
            <p style="color: #94A3B8; font-size: 10px; line-height: 1.8;">Bawa E-Ticket ini & KTP asli saat pengambilan perlengkapan lari. Sampai jumpa di garis start, Pahlawan!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Konfigurasi Pengiriman dengan Header Tambahan
    const mailOptions = {
      from: `"Surabaya Heritage Run" <${process.env.EMAILSENDER}>`,
      to: participant.email,
      subject: `E-Ticket #${participant.bibNumber} - ${participant.fullName} (${participant.category})`,
      text: `Halo ${participant.fullName}, Pembayaran Anda Berhasil. Nomor BIB Anda: #${participant.bibNumber}. Silakan cek email ini di device yang mendukung HTML untuk melihat QR Ticket Anda.`,
      html: emailContent,
      attachments: [
        {
          filename: `BIB-${participant.bibNumber}.png`,
          content: base64Data,
          encoding: "base64",
          cid: "qrcode_ticket",
        },
      ],
      // Menandai sebagai email penting agar tidak masuk Tab Promotion/Spam
      priority: "high",
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Tiket #${participant.bibNumber} terkirim ke ${participant.email}`,
    );
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};
