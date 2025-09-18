import pool from '../config/db.js';

const verifyResetCode = async (req, res) => {
  const { email, resetCode } = req.body;

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

    res.status(200).json({
      status: 'success',
      message: 'Kode reset valid',
    });
  } catch (err) {
    console.error('Error verifying reset code:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export { verifyResetCode };
