require("dotenv").config();
const pool = require("../config/db");
const { registerSchema } = require("./schema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const { username, fullName, email, password, confirmPassword, role } =
    req.body;

  // Validasi input menggunakan Joi
  const { error } = registerSchema.validate({
    username,
    fullName,
    email,
    password,
    confirmPassword,
    role,
  });

  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  // Cek apakah password cocok
  if (password !== confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "Password tidak cocok",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Cek username atau email sudah terdaftar
    const checkUserQuery = `
      SELECT 1 FROM users WHERE username = $1 OR email = $2`;
    const checkResult = await client.query(checkUserQuery, [username, email]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        status: "fail",
        message: "Username atau email sudah digunakan",
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Masukkan ke tabel users dengan is_verified = false
    const insertQuery = `
      INSERT INTO users (username, full_name, email, password, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, false)
    `;
    await client.query(insertQuery, [
      username,
      fullName,
      email,
      hashedPassword,
      role || "user", // default role user jika tidak diberi
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Akun berhasil dibuat. Menunggu verifikasi dari admin.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error registering user:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

module.exports = { registerUser };