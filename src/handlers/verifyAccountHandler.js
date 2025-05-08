const pool = require("../config/db");
const nodemailer = require("nodemailer");

// Konfigurasi nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verifyAccount = async (req, res) => {
  const { email } = req.params;

  try {
    const client = await pool.connect();

    // Cek apakah pengguna ada dan belum diverifikasi
    const checkQuery = `
      SELECT * FROM users WHERE email = $1 AND is_verified = false
    `;
    const checkResult = await client.query(checkQuery, [email]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Pengguna tidak ditemukan atau sudah diverifikasi",
      });
    }

    const user = checkResult.rows[0];

    // Update status verifikasi
    const updateQuery = `
      UPDATE users SET is_verified = true WHERE email = $1
    `;
    await client.query(updateQuery, [email]);

    client.release();

    // Kirim email notifikasi kepada pengguna
    const mailOptions = {
      from: {
        name: "Sistem Monev",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Akun Anda Telah Diverifikasi",
      text: `Halo ${user.full_name},

Akun Anda dengan email ${email} telah berhasil diverifikasi oleh admin.

Silakan login menggunakan kredensial Anda.

Terima kasih telah bergabung dengan Sistem Monev!

Salam hangat,
Tim Sistem Monev`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).json({
          status: "error",
          message: "Gagal mengirim email verifikasi",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Akun pengguna berhasil diverifikasi dan email telah dikirim",
      });
    });
  } catch (err) {
    console.error("Error verifying user:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { verifyAccount };