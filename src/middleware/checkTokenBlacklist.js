import pool from '../config/db.js';

const checkTokenBlacklist = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak ditemukan',
    });
  }

  try {
    // Cek apakah token ada di blacklist
    const query = 'SELECT 1 FROM token_blacklist WHERE token = $1';
    const result = await pool.query(query, [token]);

    if (result.rows.length > 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token telah di-blacklist',
      });
    }

    next();
  } catch (err) {
    console.error('Error checking token blacklist:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export { checkTokenBlacklist };
