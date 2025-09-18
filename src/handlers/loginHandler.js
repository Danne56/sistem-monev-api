import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { loginSchema } from './schema.js';

dotenv.config();

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }

  try {
    // Cek apakah email ada di tabel users
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Email tidak terdaftar',
      });
    }

    const user = userResult.rows[0];

    // Cek apakah akun belum diverifikasi
    if (!user.is_verified) {
      return res.status(403).json({
        status: 'fail',
        message:
          'Akun belum diverifikasi. Silakan tunggu verifikasi dari admin.',
      });
    }

    // Cek password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Password salah',
      });
    }

    // Buat token JWT
    const secret =
      process.env.NODE_ENV === 'development'
        ? process.env.JWT_SECRET_DEV
        : process.env.JWT_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Secret key tidak tersedia.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullname: user.full_name,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      token,
    });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export { loginUser };
