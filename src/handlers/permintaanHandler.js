import { nanoid } from 'nanoid';
import pool from '../config/db.js';
import { createPermintaanSchema, updatePermintaanSchema } from './schema.js';

// Menambahkan permintaan
const addPermintaan = async (req, res) => {
  const { email, kd_desa, status_permintaan } = req.body;

  // Validasi input
  const { error } = createPermintaanSchema.validate({
    email,
    kd_desa,
    status_permintaan,
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

    // Generate kode permintaan otomatis
    const kd_permintaan = `REQ-${nanoid(10)}`;

    // Cek apakah email pengguna valid
    const checkEmailQuery = 'SELECT 1 FROM users WHERE email = $1';
    const checkEmailResult = await client.query(checkEmailQuery, [email]);
    if (checkEmailResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'fail',
        message: 'Email tidak terdaftar',
      });
    }

    // Cek apakah kode desa wisata valid
    const checkDesaQuery = 'SELECT 1 FROM desa_wisata WHERE kd_desa = $1';
    const checkDesaResult = await client.query(checkDesaQuery, [kd_desa]);
    if (checkDesaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'fail',
        message: 'Kode desa wisata tidak ditemukan',
      });
    }

    // Insert data permintaan
    const insertQuery = `
        INSERT INTO permintaan (kd_permintaan, email, kd_desa, status_permintaan, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `;
    await client.query(insertQuery, [
      kd_permintaan,
      email,
      kd_desa,
      status_permintaan,
    ]);

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'success',
      message: 'Permintaan berhasil ditambahkan',
      data: {
        kd_permintaan,
        email,
        kd_desa,
        status_permintaan,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding permintaan:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

const getAllPermintaan = async (req, res) => {
  try {
    const query = `
        SELECT p.kd_permintaan, p.email, dw.nama_desa AS nama_desa_wisata, p.created_at, p.status_permintaan, p.kd_desa
        FROM permintaan p
        LEFT JOIN users u ON p.email = u.email
        LEFT JOIN desa_wisata dw ON p.kd_desa = dw.kd_desa
        ORDER BY p.created_at DESC
      `;
    const result = await pool.query(query);

    return res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (err) {
    console.error('Error fetching permintaan:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const getPermintaanById = async (req, res) => {
  const { kd_permintaan } = req.params;

  try {
    const query = `
        SELECT p.kd_permintaan, p.email, dw.nama_desa AS nama_desa_wisata, p.created_at, p.status_permintaan, p.kd_desa
        FROM permintaan p
        LEFT JOIN users u ON p.email = u.email
        LEFT JOIN desa_wisata dw ON p.kd_desa = dw.kd_desa
        WHERE p.kd_permintaan = $1
      `;
    const result = await pool.query(query, [kd_permintaan]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Permintaan tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching permintaan:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const updatePermintaan = async (req, res) => {
  const { kd_permintaan } = req.params;
  const { status_permintaan } = req.body;

  // Validasi input
  const { error } = updatePermintaanSchema.validate({
    status_permintaan,
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

    // Cek apakah permintaan ada
    const checkQuery = 'SELECT 1 FROM permintaan WHERE kd_permintaan = $1';
    const checkResult = await client.query(checkQuery, [kd_permintaan]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'fail',
        message: 'Permintaan tidak ditemukan',
      });
    }

    // Update status_permintaan dan updated_at
    const updateQuery = `
        UPDATE permintaan
        SET status_permintaan = $1, updated_at = NOW()
        WHERE kd_permintaan = $2
      `;
    await client.query(updateQuery, [status_permintaan, kd_permintaan]);

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'success',
      message: 'Status permintaan berhasil diperbarui',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating permintaan:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

const deletePermintaan = async (req, res) => {
  const { kd_permintaan } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek apakah permintaan ada
    const checkQuery = 'SELECT 1 FROM permintaan WHERE kd_permintaan = $1';
    const checkResult = await client.query(checkQuery, [kd_permintaan]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'fail',
        message: 'Permintaan tidak ditemukan',
      });
    }

    // Hapus data dari tabel permintaan
    const deleteQuery = 'DELETE FROM permintaan WHERE kd_permintaan = $1';
    await client.query(deleteQuery, [kd_permintaan]);

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'success',
      message: 'Permintaan berhasil dihapus',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting permintaan:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  } finally {
    client.release();
  }
};

export {
  addPermintaan,
  deletePermintaan,
  getAllPermintaan,
  getPermintaanById,
  updatePermintaan,
};
