const pool = require("../config/db");
const { deskripsiWisataSchema } = require("../handlers/schema");

// Fungsi untuk menambahkan deskripsi wisata
const addDeskripsiWisata = async (req, res) => {
  const {
    kd_desa,
    penjelasan_umum,
    fasilitas,
    dokumentasi_desa,
    atraksi,
    penginapan,
    paket_wisata,
    suvenir,
  } = req.body;

  // Validasi input menggunakan Joi
  const { error } = deskripsiWisataSchema.validate({
    kd_desa,
    penjelasan_umum,
    fasilitas,
    dokumentasi_desa,
    atraksi,
    penginapan,
    paket_wisata,
    suvenir,
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

    // Cek apakah desa wisata ada
    const checkDesaQuery = "SELECT 1 FROM desa_wisata WHERE kd_desa = $1";
    const checkDesaResult = await client.query(checkDesaQuery, [kd_desa]);

    if (checkDesaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "fail",
        message: "Desa wisata tidak ditemukan",
      });
    }

    // Insert data deskripsi wisata
    const insertQuery = `
    INSERT INTO deskripsi_wisata (
      kd_desa, penjelasan_umum, fasilitas, dokumentasi_desa, atraksi, penginapan, paket_wisata, suvenir
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
    await client.query(insertQuery, [
      kd_desa,
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      JSON.stringify(atraksi),
      JSON.stringify(penginapan),
      JSON.stringify(paket_wisata),
      JSON.stringify(suvenir),
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Deskripsi wisata berhasil ditambahkan",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error adding deskripsi wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// Fungsi untuk mendapatkan semua deskripsi wisata
const getAllDeskripsiWisata = async (req, res) => {
  try {
    const query = "SELECT * FROM deskripsi_wisata ORDER BY kd_desa ASC";
    const result = await pool.query(query);

    return res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching deskripsi wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Fungsi untuk mendapatkan deskripsi wisata berdasarkan kd_desa
const getDeskripsiWisataByKdDesa = async (req, res) => {
  const { kd_desa } = req.params;

  try {
    const query = "SELECT * FROM deskripsi_wisata WHERE kd_desa = $1";
    const result = await pool.query(query, [kd_desa]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Deskripsi wisata tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching deskripsi wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Fungsi untuk mengupdate deskripsi wisata
const updateDeskripsiWisata = async (req, res) => {
  const { kd_desa } = req.params;
  const {
    penjelasan_umum,
    fasilitas,
    dokumentasi_desa,
    atraksi,
    penginapan,
    paket_wisata,
    suvenir,
  } = req.body;

  // Validasi input menggunakan Joi
  const { error } = deskripsiWisataSchema.validate({
    penjelasan_umum,
    fasilitas,
    dokumentasi_desa,
    atraksi,
    penginapan,
    paket_wisata,
    suvenir,
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

    // Cek apakah deskripsi wisata ada
    const checkQuery = "SELECT 1 FROM deskripsi_wisata WHERE kd_desa = $1";
    const checkResult = await client.query(checkQuery, [kd_desa]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "fail",
        message: "Deskripsi wisata tidak ditemukan",
      });
    }

    // Update data deskripsi wisata
    const updateQuery = `
      UPDATE deskripsi_wisata
      SET penjelasan_umum = $1, fasilitas = $2, dokumentasi_desa = $3, atraksi = $4, penginapan = $5, paket_wisata = $6, suvenir = $7
      WHERE kd_desa = $8
    `;
    await client.query(updateQuery, [
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      atraksi, // Data JSONB
      penginapan, // Data JSONB
      paket_wisata, // Data JSONB
      suvenir, // Data JSONB
      kd_desa,
    ]);

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Deskripsi wisata berhasil diperbarui",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error updating deskripsi wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// Fungsi untuk menghapus deskripsi wisata
const deleteDeskripsiWisata = async (req, res) => {
  const { kd_desa } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek apakah deskripsi wisata ada
    const checkQuery = "SELECT 1 FROM deskripsi_wisata WHERE kd_desa = $1";
    const checkResult = await client.query(checkQuery, [kd_desa]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "fail",
        message: "Deskripsi wisata tidak ditemukan",
      });
    }

    // Hapus data deskripsi wisata
    const deleteQuery = "DELETE FROM deskripsi_wisata WHERE kd_desa = $1";
    await client.query(deleteQuery, [kd_desa]);

    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Deskripsi wisata berhasil dihapus",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error deleting deskripsi wisata:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  addDeskripsiWisata,
  getAllDeskripsiWisata,
  getDeskripsiWisataByKdDesa,
  updateDeskripsiWisata,
  deleteDeskripsiWisata,
};
