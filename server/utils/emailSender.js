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
});

exports.sendTicketEmail = async (participant) => {
  try {
    // 1. Generate QR Code
    const qrCodeDataURL = await QRCode.toDataURL(participant._id.toString(), {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 400,
      color: {
        dark: "#000000", // Hitam pekat agar kontras maksimal
        light: "#FFFFFF",
      },
    });
    const base64Data = qrCodeDataURL.split(",")[1];

    // Format Data
    const formattedPrice = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(participant.pricePaid);

    const eventDate = "Minggu, 12 Oktober 2026";
    const startTime = participant.category === "5K" ? "05:30 WIB" : "06:00 WIB";

    // 2. TEMPLATE HTML (SWISS STYLE / RED-BLACK THEME)
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-Ticket Surabaya Heritage Run</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          
          body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', Helvetica, Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          
          /* HEADER DESIGN */
          .header { background-color: #0F172A; padding: 40px 30px; text-align: center; border-bottom: 4px solid #DC2626; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
          .header p { margin: 5px 0 0; color: #94A3B8; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
          
          /* BODY CONTENT */
          .content { padding: 40px 30px; }
          .welcome-text { text-align: center; margin-bottom: 30px; }
          .welcome-text h2 { margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; }
          .welcome-text p { margin: 0; color: #64748B; font-size: 14px; line-height: 1.5; }
          
          /* TICKET CARD (BOARDING PASS STYLE) */
          .ticket-box { border: 2px solid #E2E8F0; border-radius: 16px; overflow: hidden; margin-bottom: 30px; }
          
          .ticket-top { background-color: #F1F5F9; padding: 20px; border-bottom: 2px dashed #CBD5E1; display: flex; align-items: center; justify-content: space-between; }
          .ticket-category { background-color: #DC2626; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 900; font-size: 14px; display: inline-block; }
          
          .ticket-body { padding: 25px; text-align: center; }
          
          .qr-container { margin: 20px 0; padding: 15px; background: #FFFFFF; border: 4px solid #0F172A; display: inline-block; border-radius: 12px; }
          .qr-img { width: 180px; height: auto; display: block; }
          
          /* INFO GRID */
          .info-grid { width: 100%; margin-top: 20px; text-align: left; }
          .info-cell { padding-bottom: 15px; width: 50%; vertical-align: top; }
          .label { font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
          .value { font-size: 16px; color: #0F172A; font-weight: 700; }
          .value-red { color: #DC2626; }
          
          /* FOOTER */
          .footer { background-color: #0F172A; padding: 30px; text-align: center; color: #475569; font-size: 11px; }
          .footer p { margin: 5px 0; }
          .footer a { color: #94A3B8; text-decoration: none; }
        </style>
      </head>
      <body>
        
        <div style="padding: 20px;">
          <div class="wrapper" style="border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
            
            <div class="header">
              <h1>Surabaya <span style="color: #DC2626;">Heritage</span> Run</h1>
              <p>Official E-Ticket 2026</p>
            </div>

            <div class="content">
              
              <div class="welcome-text">
                <h2>Halo, ${participant.fullName}</h2>
                <p>Pembayaran sebesar <strong>${formattedPrice}</strong> berhasil diverifikasi.<br>Simpan tiket ini untuk registrasi ulang.</p>
              </div>

              <div class="ticket-box">
                <div class="ticket-top">
                  <table width="100%">
                    <tr>
                      <td align="left">
                        <span class="label">KATEGORI LARI</span>
                        <span class="ticket-category">${participant.category} RUN</span>
                      </td>
                      <td align="right">
                        <span class="label">STATUS</span>
                        <strong style="color: #16A34A; font-size: 12px;">PAID / LUNAS</strong>
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="ticket-body">
                  <table class="info-grid">
                    <tr>
                      <td class="info-cell">
                        <span class="label">NOMOR BIB</span>
                        <span class="value value-red" style="font-size: 24px;">#${participant.bibNumber || "WAITING"}</span>
                      </td>
                      <td class="info-cell">
                        <span class="label">UKURAN JERSEY</span>
                        <span class="value">${participant.jerseySize}</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="info-cell">
                        <span class="label">TANGGAL EVENT</span>
                        <span class="value">12 Okt 2026</span>
                      </td>
                      <td class="info-cell">
                        <span class="label">WAKTU START</span>
                        <span class="value">${startTime}</span>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 10px; border-top: 1px dashed #CBD5E1; padding-top: 20px;">
                    <div class="qr-container">
                      <img src="cid:qrcode_ticket" alt="QR Code" class="qr-img" />
                    </div>
                    <p style="font-size: 11px; color: #64748B; margin: 5px 0;">Scan QR Code ini di meja registrasi</p>
                    <p style="font-size: 10px; color: #94A3B8;">ID: ${participant._id}</p>
                  </div>
                </div>
              </div>

              <div style="text-align: center;">
                <p style="font-size: 12px; color: #64748B;">
                  Lokasi: <strong>Balai Kota Surabaya</strong><br>
                  Harap datang 30 menit sebelum waktu start.
                </p>
              </div>

            </div>

            <div class="footer">
              <p>&copy; 2026 Surabaya Heritage Run. All rights reserved.</p>
              <p>Email ini dikirim secara otomatis. Mohon tidak membalas.</p>
            </div>

          </div>
        </div>

      </body>
      </html>
    `;

    // 3. Konfigurasi Pengiriman
    const mailOptions = {
      from: `"Surabaya Heritage Run" <${process.env.EMAILSENDER}>`, // Menggunakan ENV emailSender
      to: participant.email,
      subject: `[E-TICKET] Pembayaran Berhasil - ${participant.fullName}`,
      html: emailContent,
      attachments: [
        {
          filename: `ticket-${participant._id}.png`,
          content: base64Data,
          encoding: "base64",
          cid: "qrcode_ticket", // CID agar gambar muncul di body email
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email Tiket Terkirim ke:", participant.email);
  } catch (error) {
    console.error("❌ Gagal Mengirim Email:", error);
  }
};
