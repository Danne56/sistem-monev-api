import express from 'express';
import {
  addDeskripsiDesa,
  deleteDeskripsiDesa,
  getDeskripsiDesaByKdDesa,
  handleUploadErrors,
  updateDeskripsiDesa,
  uploadFields,
} from '../handlers/deskripsiDesaHandler.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/checkOwnership.js';

const router = express.Router();

// POST - Buat deskripsi desa baru
router.post(
  '/deskripsi-desa',
  authenticateToken,
  checkRole('pengelola'),
  uploadFields,
  handleUploadErrors,
  checkOwnership,
  addDeskripsiDesa
);

// GET - Ambil deskripsi desa berdasarkan kd_desa
router.get('/deskripsi-desa/:kd_desa', getDeskripsiDesaByKdDesa);

// PUT - Update deskripsi desa
router.put(
  '/deskripsi-desa/:kd_desa',
  authenticateToken,
  checkRole('pengelola'),
  checkOwnership,
  uploadFields,
  handleUploadErrors,
  updateDeskripsiDesa
);

// DELETE - Hapus deskripsi desa
router.delete(
  '/deskripsi-desa/:kd_desa',
  authenticateToken,
  checkRole('pengelola'),
  checkOwnership,
  deleteDeskripsiDesa
);

export default router;
