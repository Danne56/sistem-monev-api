require("dotenv").config();
const pool = require("../config/db");
const { registerSchema } = require("./schema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Konfigurasi nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerUser = async (req, res) => {
  const { username, fullName, email, password, confirmPassword, role } = req.body;

  // Validasi input menggunakan Joi
  const { error } = registerSchema.validate({
    username,
    fullName,
    email,
    password,
    confirmPassword,
    role
  });
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  try {
    // Cek apakah username sudah terdaftar
    const userCheckQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await pool.query(userCheckQuery, [username]);
    if (userResult.rows.length > 0) {
      return res.status(409).json({
        status: "fail",
        message: "Username sudah digunakan",
      });
    }

    // Cek apakah email sudah terdaftar
    const emailCheckQuery = "SELECT * FROM users WHERE email = $1";
    const emailResult = await pool.query(emailCheckQuery, [email]);
    if (emailResult.rows.length > 0) {
      return res.status(409).json({
        status: "fail",
        message: "Email sudah digunakan",
      });
    }

    // Hash password menggunakan bcrypt
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat kode verifikasi berupa angka (6 digit)
    const verificationCode = crypto.randomInt(10000, 100000).toString();

    // Simpan data pengguna dan kode verifikasi ke database
    const insertQuery = `
      INSERT INTO email_verifications (username, full_name, email, password, role, verification_code, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await pool.query(insertQuery, [username, fullName, email, hashedPassword, role, verificationCode]);

    // Kirim email verifikasi
    const mailOptions = {
        from: {
          name: "Sistem Monev",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Kode Verifikasi untuk Akun Sistem Monev Anda",
        text: `Halo ${fullName},
      
      Terima kasih telah bergabung dengan Sistem Monev! Untuk melanjutkan proses registrasi, silakan gunakan kode verifikasi berikut:
      
      Kode Verifikasi: ${verificationCode}
      
      Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.
      
      Jika Anda tidak merasa melakukan permintaan kode verifikasi ini, silakan abaikan email ini atau hubungi tim dukungan kami segera.
      
      Salam hangat,
      Tim Sistem Monev`,
      };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: "error",
          message: "Failed to send verification code",
        });
      } else {
        return res.status(201).json({
          status: "success",
          message: "Verification code has been sent to email",
        });
      }
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { registerUser };