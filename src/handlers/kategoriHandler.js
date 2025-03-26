require("dotenv").config();
const { Pool } = require("pg");
const { kategoriSchema } = require("./schema");
const pool = require("../config/db");

const addKategoriDesaWisata = async (req, res) => {
  const { kd_kategori_desa_wisata, nama_kategori, nilai } = req.body;

  // Validasi input menggunakan Joi
  const { error } = kategoriSchema.validate({
    kd_kategori_desa_wisata,
    nama_kategori,
    nilai,
  });

  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  // Cek role pengguna
  const userRole = req.user.role;
  if (userRole !== "dinas") {
    return res.status(403).json({
      status: "fail",
      message: "Hanya role dinas yang dapat menambahkan kategori.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek apakah kode kategori sudah ada
    const checkQuery = "SELECT 1 FROM kategori_desa_wisata WHERE kd_kategori_desa_wisata = $1";
    const checkResult = await client.query(checkQuery, [kd_kategori_desa_wisata]);

    if (checkResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        status: "fail",
        message: "Kode kategori desa wisata sudah digunakan",
      });
    }

    // Insert data kategori baru
    const insertQuery = `
      INSERT INTO kategori_desa_wisata (kd_kategori_desa_wisata, nama_kategori, nilai)
      VALUES ($1, $2, $3)
    `;
    await client.query(insertQuery, [kd_kategori_desa_wisata, nama_kategori, nilai]);

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Kategori desa wisata berhasil ditambahkan",
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error adding kategori desa wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });

  } finally {
    client.release();
  }
};

module.exports = { addKategoriDesaWisata };