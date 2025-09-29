const { nanoid } = require('nanoid');
const pool = require('../config/db');
const {
  updateStatusDesaSchema,
  createStatusDesaSchema,
} = require('../handlers/schema');

// Fungsi untuk menambahkan status desa
const addStatusDesa = async (req, res) => {
  const { kd_desa, status, keterangan } = req.body;
  const kd_status = `STAT-${nanoid(10)}`;

  // Validasi input menggunakan Joi
  const { error } = createStatusDesaSchema.validate({
    kd_desa,
    status,
    keterangan,
  });

  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek apakah desa wisata ada
    const checkDesaQuery = 'SELECT 1 FROM desa_wisata WHERE kd_desa = $1';
    const checkDesaResult = await client.query(checkDesaQuery, [kd_desa]);

    if (checkDesaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'fail',
        message: 'Desa wisata tidak ditemukan',
      });
    }

    // Insert data status desa
    const insertQuery = `
      INSERT INTO status_desa (kd_status, kd_desa, status, keterangan, tanggal_update)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await client.query(insertQuery, [kd_status, kd_desa, status, keterangan]);

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'success',
      message: 'Status desa berhasil ditambahkan',
      data: {
        kd_status,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Error adding status desa:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

// Fungsi untuk mendapatkan semua status desa
const getAllStatusDesa = async (req, res) => {
  try {
    const query = `
    SELECT s.kd_status, s.status, s.keterangan, s.tanggal_update, dw.nama_desa AS nama_desa_wisata, dw.provinsi, dw.kabupaten
    FROM status_desa s
    LEFT JOIN desa_wisata dw ON s.kd_desa = dw.kd_desa
    ORDER BY s.tanggal_update DESC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (err) {
    console.error('Error fetching status desa:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Fungsi untuk mendapatkan status desa berdasarkan kd_status
const getStatusDesaByKdStatus = async (req, res) => {
  const { kd_status } = req.params;

  try {
    const query = 'SELECT * FROM status_desa WHERE kd_status = $1';
    const result = await pool.query(query, [kd_status]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Status desa tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching status desa:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Fungsi untuk mengupdate status desa
const updateStatusDesa = async (req, res) => {
  const { kd_status } = req.params;
  const { status, keterangan } = req.body;

  // Validasi input menggunakan Joi
  const { error } = updateStatusDesaSchema.validate({
    status,
    keterangan,
  });

  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek apakah status desa ada
    const checkQuery = 'SELECT 1 FROM status_desa WHERE kd_status = $1';
    const checkResult = await client.query(checkQuery, [kd_status]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'fail',
        message: 'Status desa tidak ditemukan',
      });
    }

    // Update data status desa
    const updateQuery = `
      UPDATE status_desa
      SET status = $1, keterangan = $2, tanggal_update = NOW()
      WHERE kd_status = $3
    `;
    await client.query(updateQuery, [status, keterangan, kd_status]);

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'success',
      message: 'Status desa berhasil diperbarui',
    });
  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Error updating status desa:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

// Fungsi untuk menghapus status desa
const deleteStatusDesa = async (req, res) => {
  const { kd_status } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek apakah status desa ada
    const checkQuery = 'SELECT 1 FROM status_desa WHERE kd_status = $1';
    const checkResult = await client.query(checkQuery, [kd_status]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'fail',
        message: 'Status desa tidak ditemukan',
      });
    }

    // Hapus data status desa
    const deleteQuery = 'DELETE FROM status_desa WHERE kd_status = $1';
    await client.query(deleteQuery, [kd_status]);

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'success',
      message: 'Status desa berhasil dihapus',
    });
  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Error deleting status desa:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  addStatusDesa,
  getAllStatusDesa,
  getStatusDesaByKdStatus,
  updateStatusDesa,
  deleteStatusDesa,
};
