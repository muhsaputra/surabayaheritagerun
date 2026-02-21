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
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

exports.sendTicketEmail = async (participant) => {
  try {
    // 1. Generate QR Code - Resolusi Tinggi dengan Kontras Maksimal
    const qrCodeDataURL = await QRCode.toDataURL(participant._id.toString(), {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 600,
      color: {
        dark: "#1B4D3E", // Hijau Heritage
        light: "#FFFFFF",
      },
    });

    // Pastikan hanya mengambil string base64-nya saja
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");

    const eventDayDate = "Minggu, 24 Mei 2026";
    const flagOffTime = "06.00 WIB";
    const venueName = "Plaza Internatio";
    const startFinishLocation = "Jl. Garuda, Surabaya";

    // 2. TEMPLATE HTML (Fixed for Mobile & Outlook)
    const emailContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-Ticket Surabaya Heritage Run 2026</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FDFBF7;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB;">
                
                <tr>
                  <td align="center" style="background-color: #450a0a; padding: 40px 20px; border-bottom: 6px solid #D4AF37;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">SURABAYA <span style="color: #D4AF37;">HERITAGE</span> RUN</h1>
                    <p style="margin: 8px 0 0; color: #D4AF37; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: bold;">Official E-Ticket 2026</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px 20px 30px; text-align: center;">
                    <h2 style="color: #1B4D3E; margin: 0; font-size: 24px; font-weight: bold;">Halo, ${participant.fullName}!</h2>
                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-top: 15px;">
                      <tr>
                        <td style="background-color: #F0FDF4; color: #16A34A; padding: 8px 18px; border-radius: 99px; font-size: 11px; font-weight: 800; border: 1px solid #BBF7D0; text-transform: uppercase;">
                          Pembayaran Terverifikasi
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 30px 40px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid #F3F4F6; border-radius: 20px; overflow: hidden;">
                      
                      <tr>
                        <td style="background-color: #F9FAFB; padding: 25px; border-bottom: 2px dashed #E5E7EB;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="50%" style="vertical-align: middle;">
                                <p style="font-size: 9px; color: #6B7280; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Kategori Lari</p>
                                <p style="font-size: 18px; color: #9B1B1B; font-weight: 900; margin: 4px 0 0;">${participant.category} RUN</p>
                              </td>
                              <td width="50%" align="right" style="vertical-align: middle;">
                                <p style="font-size: 9px; color: #6B7280; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Nomor BIB</p>
                                <p style="font-size: 28px; color: #1B4D3E; font-weight: 900; margin: 4px 0 0;">#${participant.bibNumber || "---"}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 25px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                            <tr>
                              <td width="50%" style="padding-bottom: 20px;">
                                <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Waktu Start</span>
                                <span style="font-weight: 700; color: #1F2937;">${eventDayDate}<br>${flagOffTime}</span>
                              </td>
                              <td width="50%" style="padding-bottom: 20px;">
                                <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Lokasi</span>
                                <span style="font-weight: 700; color: #1F2937;">${venueName}</span>
                              </td>
                            </tr>
                            <tr>
                              <td width="50%">
                                <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Jersey</span>
                                <span style="font-weight: 700; color: #1F2937;">Size: ${participant.jerseySize}</span>
                              </td>
                              <td width="50%">
                                <span style="display:block; font-size: 9px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Status</span>
                                <span style="font-weight: 700; color: #16A34A;">PAID / LUNAS</span>
                              </td>
                            </tr>
                          </table>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top: 30px;">
                            <tr>
                              <td align="center">
                                <div style="display: inline-block; padding: 12px; border: 2px solid #1B4D3E; border-radius: 16px; background-color: #ffffff;">
                                  <img src="cid:qrcode_ticket" width="200" height="200" alt="Ticket QR" style="display: block; border: 0; outline: none; text-decoration: none;">
                                </div>
                                <p style="margin: 20px 0 0; font-weight: 900; color: #1B4D3E; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Scan QR saat pengambilan Race Pack</p>
                                <p style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #94A3B8; margin: 5px 0 0;">ID: ${participant._id}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="background-color: #0F172A; padding: 30px; border-top: 1px solid #1e293b;">
                    <p style="color: #ffffff; font-size: 12px; margin: 0 0 10px; font-weight: bold;">Surabaya Heritage Run 2026</p>
                    <p style="color: #94A3B8; font-size: 10px; line-height: 1.6; margin: 0;">Harap simpan email ini. Tunjukkan QR Code di atas beserta KTP asli saat pengambilan perlengkapan lari (Race Pack Collection).</p>
                    <p style="color: #D4AF37; font-size: 9px; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0;">&copy; Panitia Surabaya Heritage Run</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Surabaya Heritage Run" <${process.env.EMAILSENDER}>`,
      to: participant.email,
      subject: `E-Ticket #${participant.bibNumber} - ${participant.fullName} [LUNAS]`,
      text: `Halo ${participant.fullName}, Pembayaran Anda Berhasil. BIB: #${participant.bibNumber}. Lokasi: Plaza Internatio, 24 Mei 2026.`,
      html: emailContent,
      attachments: [
        {
          filename: `BIB-${participant.bibNumber}.png`,
          content: base64Data,
          encoding: "base64",
          cid: "qrcode_ticket",
          contentType: "image/png",
          disposition: "inline",
        },
      ],
      priority: "high",
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email Tiket Berhasil Terkirim: BIB #${participant.bibNumber} (${participant.email})`,
    );
  } catch (error) {
    console.error("❌ Critical Email Error:", error);
  }
};
