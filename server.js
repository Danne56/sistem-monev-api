import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './src/routes/authRoutes.js';
import desaWisataRoutes from './src/routes/desaWisataRoutes.js';
import deskripsiDesaRoutes from './src/routes/deskripsiDesaRoutes.js';
import deskripsiWisataRoutes from './src/routes/deskripsiWisataRoutes.js';
import permintaanRoutes from './src/routes/permintaanRoutes.js';
import skorDesaRoutes from './src/routes/skorDesaRoutes.js';
import statusDesaRoutes from './src/routes/statusDesaRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Security middleware
app.disable('x-powered-by');
app.use(helmet());

app.use(cors({ origin: '*' })); // Mengizinkan semua origin untuk akses API

// Debug Logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(
      '\n[DEV]',
      req.method,
      req.url,
      '| Body:',
      req.body,
      '| Query:',
      req.query
    );
    next();
  });
} else {
  app.use((req, res, next) => {
    console.log(req.method, req.url); // Menampilkan metode dan URL dari request
    next();
  });
}

// Middleware untuk memastikan route development tidak dipakai di production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Blokir akses ke route mock data
    if (req.path.startsWith('/authentication/mock')) {
      return res.status(404).json({
        status: 'fail',
        message: 'Route tidak ditemukan',
      });
    }
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use(
  '/api',
  desaWisataRoutes,
  deskripsiWisataRoutes,
  statusDesaRoutes,
  permintaanRoutes,
  skorDesaRoutes,
  deskripsiDesaRoutes,
  userRoutes
);

app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
  next();
});

app.use((err, req, res) => {
  const errorResponse = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };
  console.error(errorResponse);
  res.status(500).json(errorResponse);
});

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err);
  process.exit(1); // Keluar dengan status error
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
