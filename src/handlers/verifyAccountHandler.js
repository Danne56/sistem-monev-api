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

  const client = await pool.connect();

  try {
    // Ambil data pengguna
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    const checkResult = await client.query(checkQuery, [email]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Pengguna tidak ditemukan",
      });
    }

    const user = checkResult.rows[0];

    // Toggle status is_verified
    const newVerificationStatus = !user.is_verified;

    // Update status di database
    const updateQuery = "UPDATE users SET is_verified = $1 WHERE email = $2";
    await client.query(updateQuery, [newVerificationStatus, email]);
    client.release();

    // Kirim notifikasi email
    const mailOptions = {
      from: {
        name: "Sistem Monev",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: newVerificationStatus
        ? "Akun Anda Telah Diverifikasi"
        : "Verifikasi Akun Dicabut",
      text: `Halo ${user.full_name},

${
  newVerificationStatus
    ? `Akun Anda dengan email ${email} telah diverifikasi oleh admin.`
    : `Verifikasi akun Anda dengan email ${email} telah dicabut oleh admin.`
}

Silakan login untuk melihat perubahan.

Terima kasih,
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
    });

    return res.status(200).json({
      status: "success",
      message: `Akun pengguna berhasil ${
        newVerificationStatus ? "diverifikasi" : "dinonaktifkan"
      }, dan email telah dikirim.`,
    });
  } catch (err) {
    client.release();
    console.error("Error verifying user:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { verifyAccount };
