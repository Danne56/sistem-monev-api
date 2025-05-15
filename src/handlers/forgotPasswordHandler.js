const pool = require("../config/db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Import schema validasi
const { forgotPasswordSchema } = require("./schema");

// Setup transporter Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validasi input
  const { error } = forgotPasswordSchema.validate({ email });
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  try {
    // Cari user berdasarkan email
    const userQuery = "SELECT id, full_name FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Email tidak ditemukan",
      });
    }

    const user = userResult.rows[0];
    const fullName = user.full_name;
    const userId = user.id;

    // Generate kode reset (6 digit)
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Kadaluarsa dalam 5 menit

    // Simpan atau update kode reset di database
    const upsertQuery = `
      INSERT INTO password_resets (email, user_id, reset_code, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET
        reset_code = EXCLUDED.reset_code,
        expires_at = EXCLUDED.expires_at
    `;
    await pool.query(upsertQuery, [email, userId, resetCode, expiresAt]);

    // Kirim email dengan kode reset
    const mailOptions = {
      from: {
        name: "Sistem Monev",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Kode Reset Password",
      text: `Halo ${fullName},

Berikut adalah kode verifikasi untuk mereset password Anda:

${resetCode}

Kode ini hanya berlaku selama 5 menit.

Jika Anda tidak melakukan permintaan ini, abaikan email ini.

Terima kasih,
Tim Sistem Monev`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error mengirim email:", err);
        return res.status(500).json({
          status: "error",
          message: "Gagal mengirim email",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Kode reset password berhasil dikirim melalui email",
      });
    });
  } catch (err) {
    console.error("Error saat memproses forgot password:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { forgotPassword };