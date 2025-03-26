require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginSchema } = require("./schema");

// Inisialisasi koneksi PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  try {
    // Cek apakah email sudah diverifikasi di tabel `users`
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Jika tidak ditemukan di `users`, cek di `email_verifications`
      const verificationQuery = "SELECT * FROM email_verifications WHERE email = $1";
      const verificationResult = await pool.query(verificationQuery, [email]);

      if (verificationResult.rows.length > 0) {
        return res.status(403).json({
          status: "fail",
          message: "Akun belum diverifikasi. Silakan cek email Anda.",
        });
      }

      // Jika tidak ditemukan di kedua tabel, berarti email tidak terdaftar
      return res.status(404).json({
        status: "fail",
        message: "Email tidak terdaftar",
      });
    }

    const user = userResult.rows[0];

    // Cek password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Password salah",
      });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { algorithm: "HS512", expiresIn: "1h" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { loginUser };
