const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { resetPasswordSchema } = require('./schema');

const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  // Validasi input
  const { error } = resetPasswordSchema.validate({
    email,
    resetCode,
    newPassword,
    confirmPassword,
  });

  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password baru dan konfirmasi password tidak cocok',
    });
  }

  try {
    // Cek apakah kode reset valid dan belum kadaluarsa
    const resetQuery = `
      SELECT * FROM password_resets
      WHERE email = $1 AND reset_code = $2 AND expires_at > NOW()
    `;
    const resetResult = await pool.query(resetQuery, [email, resetCode]);

    if (resetResult.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Kode reset tidak valid atau sudah kadaluarsa',
      });
    }

    const resetData = resetResult.rows[0];

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password user
    const updateQuery = `
      UPDATE users
      SET password = $1
      WHERE id = $2
    `;
    await pool.query(updateQuery, [hashedPassword, resetData.user_id]);

    // Hapus entri dari tabel password_resets setelah digunakan
    const deleteQuery = `
      DELETE FROM password_resets
      WHERE email = $1
    `;
    await pool.query(deleteQuery, [email]);

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil direset',
    });
  } catch (err) {
    console.error('Error saat mereset password:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = { resetPassword };
