require("dotenv").config();
const { kategoriSchema } = require("./schema");
const pool = require("../config/db");
const { nanoid } = require("nanoid");

const addKategoriDesaWisata = async (req, res) => {
  const { nama_kategori, nilai } = req.body;
  const kd_kategori_desa_wisata = `KTG-${nanoid(10)}`;

  // Validasi input menggunakan Joi
  const { error } = kategoriSchema.validate({
    nama_kategori,
    nilai,
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

    // Cek apakah kode kategori sudah ada
    const checkQuery =
      "SELECT 1 FROM kategori_desa_wisata WHERE kd_kategori_desa_wisata = $1";
    const checkResult = await client.query(checkQuery, [
      kd_kategori_desa_wisata,
    ]);

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
    await client.query(insertQuery, [
      kd_kategori_desa_wisata,
      nama_kategori,
      nilai,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Kategori desa wisata berhasil ditambahkan",
      data: {
        kd_kategori_desa_wisata,
      },
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

const getAllKategoriDesaWisata = async (req, res) => {
  try {
    const query = "SELECT * FROM kategori_desa_wisata ORDER BY kd_kategori_desa_wisata ASC";
    const result = await pool.query(query);

    return res.status(200).json({
      status: "success",
      data: result.rows,
    });

  } catch (err) {
    console.error("Error fetching kategori desa wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateKategoriDesaWisata = async (req, res) => {
  const { kd_kategori_desa_wisata } = req.params; // Mengambil ID dari URL params
  const { nama_kategori, nilai } = req.body;

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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek apakah kategori ada
    const checkQuery = "SELECT 1 FROM kategori_desa_wisata WHERE kd_kategori_desa_wisata = $1";
    const checkResult = await client.query(checkQuery, [kd_kategori_desa_wisata]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "fail",
        message: "Kategori desa wisata tidak ditemukan",
      });
    }

    // Update data kategori
    const updateQuery = `
      UPDATE kategori_desa_wisata
      SET nama_kategori = $1, nilai = $2
      WHERE kd_kategori_desa_wisata = $3
    `;
    await client.query(updateQuery, [nama_kategori, nilai, kd_kategori_desa_wisata]);

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Kategori desa wisata berhasil diperbarui",
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error updating kategori desa wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });

  } finally {
    client.release();
  }
};

const deleteKategoriDesaWisata = async (req, res) => {
  const { kd_kategori_desa_wisata } = req.params; // Mengambil ID dari URL params

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek apakah kategori ada
    const checkQuery = "SELECT 1 FROM kategori_desa_wisata WHERE kd_kategori_desa_wisata = $1";
    const checkResult = await client.query(checkQuery, [kd_kategori_desa_wisata]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "fail",
        message: "Kategori desa wisata tidak ditemukan",
      });
    }

    // Hapus data kategori
    const deleteQuery = "DELETE FROM kategori_desa_wisata WHERE kd_kategori_desa_wisata = $1";
    await client.query(deleteQuery, [kd_kategori_desa_wisata]);

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Kategori desa wisata berhasil dihapus",
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error deleting kategori desa wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });

  } finally {
    client.release();
  }
};

module.exports = { addKategoriDesaWisata, getAllKategoriDesaWisata, updateKategoriDesaWisata, deleteKategoriDesaWisata };