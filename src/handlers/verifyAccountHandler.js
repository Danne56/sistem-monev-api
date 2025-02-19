const { verify } = require("crypto");
const pool = require("../config/db");
require('dotenv').config();

const verifyAccount = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Cek apakah kode verifikasi valid
        const verificationQuery = 'SELECT * FROM email_verifications WHERE email = $1 AND verification_code = $2';
        const verificationResult = await pool.query(verificationQuery, [email, verificationCode]);

        if (verificationResult.rows.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Kode verifikasi tidak valid atau pengguna tidak ditemukan',
            });
        }

        const verificationData = verificationResult.rows[0];

        // Cek apakah email sudah terdaftar sebagai user
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length > 0) {
            await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
            return res.status(409).json({
                status: 'fail',
                message: 'Email sudah terdaftar',
            });
        }

        // Simpan user baru ke database
        const insertUserQuery = `
      INSERT INTO users (username, full_name, email, password, role, is_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
        await pool.query(insertUserQuery, [
            verificationData.username,
            verificationData.full_name,
            email,
            verificationData.password,
            verificationData.role,
            true,
        ]);

        // Hapus kode verifikasi setelah digunakan
        await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

        return res.status(200).json({
            status: 'success',
            message: 'Email berhasil diverifikasi. Silakan login.',
        });
    } catch (err) {
        console.error('Terjadi kesalahan saat memverifikasi email:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan pada server',
        });
    }
};

module.exports = { verifyAccount };
