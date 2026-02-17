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
    // 1. Generate QR Code dengan kontras tinggi (Biru Tua Gelap)
    const qrCodeDataURL = await QRCode.toDataURL(participant._id.toString(), {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 400,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });
    const base64Data = qrCodeDataURL.split(",")[1];

    // Data Statis Event (Sesuai update terakhir)
    const eventDayDate = "Minggu, 24 Mei 2026";
    const flagOffTime = "06.00 WIB";
    const venueName = "Plaza Internatio";
    const startFinishLocation = "Jl. Garuda, Surabaya";

    // 2. TEMPLATE HTML (SWISS HERITAGE STYLE)
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { margin: 0; padding: 0; background-color: #F1F5F9; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          
          .header { background-color: #0F172A; padding: 40px 20px; text-align: center; border-bottom: 5px solid #DC2626; }
          .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 5px 0 0; color: #94A3B8; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }

          .content { padding: 30px; }
          .user-greeting { text-align: center; margin-bottom: 25px; }
          .user-greeting h2 { color: #0F172A; margin: 0; font-size: 24px; font-weight: 800; }
          .status-badge { display: inline-block; background-color: #DCFCE7; color: #16A34A; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; margin-top: 10px; text-transform: uppercase; }

          .ticket-card { border: 2px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
          .ticket-head { background-color: #F8FAFC; padding: 18px 20px; border-bottom: 1px dashed #CBD5E1; }
          
          .info-table { width: 100%; border-collapse: collapse; }
          .info-td { padding: 15px 20px; border-bottom: 1px dashed #CBD5E1; vertical-align: top; }
          .label { font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
          .value { font-size: 15px; color: #0F172A; font-weight: 700; display: block; }
          .value-red { color: #DC2626; font-size: 24px; font-weight: 900; }

          .qr-section { text-align: center; padding: 35px 20px; background-color: #ffffff; }
          .qr-wrapper { display: inline-block; padding: 12px; border: 3px solid #0F172A; border-radius: 16px; background: #ffffff; }
          .qr-img { width: 200px; height: 200px; display: block; }

          .footer { background-color: #0F172A; padding: 30px 20px; text-align: center; color: #94A3B8; font-size: 11px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SURABAYA <span style="color: #DC2626;">HERITAGE</span> RUN</h1>
            <p>Official E-Ticket 2026</p>
          </div>

          <div class="content">
            <div class="user-greeting">
              <h2>Halo, ${participant.fullName}!</h2>
              <div class="status-badge">PEMBAYARAN TELAH DIVERIFIKASI</div>
              <p style="color: #64748B; font-size: 14px; margin-top: 12px;">Selamat! Pendaftaran Anda telah dikonfirmasi.<br>Simpan e-ticket ini untuk pengambilan Race Pack.</p>
            </div>

            <div class="ticket-card">
              <div class="ticket-head">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td><span class="label">KATEGORI LARI</span><span class="value" style="color:#DC2626; font-size: 18px;">${participant.category} RUN</span></td>
                    <td align="right"><span class="label">NOMOR BIB</span><span class="value-red">#${participant.bibNumber || "---"}</span></td>
                  </tr>
                </table>
              </div>

              <table class="info-table" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="info-td" width="55%">
                    <span class="label">HARI & TANGGAL</span>
                    <span class="value">${eventDayDate}</span>
                  </td>
                  <td class="info-td" width="45%">
                    <span class="label">FLAG OFF</span>
                    <span class="value">${flagOffTime}</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-td">
                    <span class="label">TEMPAT (VENUE)</span>
                    <span class="value">${venueName}</span>
                  </td>
                  <td class="info-td">
                    <span class="label">START / FINISH</span>
                    <span class="value">${startFinishLocation}</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-td" style="border-bottom: none;">
                    <span class="label">UKURAN JERSEY</span>
                    <span class="value">${participant.jerseySize}</span>
                  </td>
                  <td class="info-td" style="border-bottom: none;">
                    <span class="label">STATUS TIKET</span>
                    <span class="value" style="color: #16A34A;">PAID / LUNAS</span>
                  </td>
                </tr>
              </table>

              <div class="qr-section">
                <div class="qr-wrapper">
                  <img src="cid:qrcode_ticket" alt="QR Code" class="qr-img" />
                </div>
                <p style="margin: 20px 0 5px; font-weight: 800; color: #0F172A; font-size: 14px; text-transform: uppercase;">SCAN SAAT PENGAMBILAN RACE PACK</p>
                <p style="color: #94A3B8; font-size: 10px; font-family: monospace;">ID: ${participant._id}</p>
              </div>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px; font-weight: bold; color: #ffffff;">Surabaya Heritage Run 2026</p>
            <p style="margin: 0;">Mohon tunjukkan e-ticket ini beserta KTP asli saat pengambilan Race Pack Collection (RPC). Informasi jadwal RPC akan diumumkan melalui Instagram kami.</p>
            <p style="margin: 15px 0 0;">&copy; 2026 Surabaya Heritage Run. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Konfigurasi Pengiriman
    const mailOptions = {
      from: `"Surabaya Heritage Run" <${process.env.EMAILSENDER}>`,
      to: participant.email,
      // Subject yang sangat informatif agar peserta langsung tahu nomor BIB mereka
      subject: `[E-TICKET] #${participant.bibNumber} - ${participant.fullName} (${participant.category})`,
      html: emailContent,
      attachments: [
        {
          filename: `ticket-${participant.bibNumber}.png`,
          content: base64Data,
          encoding: "base64",
          cid: "qrcode_ticket", // CID untuk menampilkan gambar di body HTML
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email Tiket (#${participant.bibNumber}) Berhasil Terkirim ke ${participant.email}`,
    );
  } catch (error) {
    console.error("❌ Gagal Mengirim Email Tiket:", error);
  }
};
