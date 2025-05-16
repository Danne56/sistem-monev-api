require("dotenv").config();
const pool = require("../config/db");
const { registerSchema } = require("./schema");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

const registerUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Validasi input menggunakan Joi
  const { error } = registerSchema.validate({
    fullName,
    email,
    password,
    role,
  });

  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Cek apakah email sudah terdaftar
    const checkUserQuery = `
      SELECT 1 FROM users WHERE email = $1`;
    const checkResult = await client.query(checkUserQuery, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        status: "fail",
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate ID unik menggunakan nanoid (misalnya panjang 10 karakter)
    const userId = `user-${nanoid(10)}`;

    // Masukkan ke tabel users dengan is_verified = false
    const insertQuery = `
      INSERT INTO users (id, full_name, email, password, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, false)
    `;
    await client.query(insertQuery, [
      userId,
      fullName,
      email,
      hashedPassword,
      role || "pengelola", // role default jika tidak diberikan
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Akun berhasil dibuat. Menunggu verifikasi dari admin.",
      data: {
        userId,
      },
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
