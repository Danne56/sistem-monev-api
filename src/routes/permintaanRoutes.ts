import express from 'express';
import {
  addPermintaan,
  deletePermintaan,
  getAllPermintaan,
  getPermintaanById,
  updatePermintaan,
} from '../handlers/permintaanHandler.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
const router = express.Router();

// Create
router.post(
  '/permintaan',
  authenticateToken,
  checkRole('pengelola'),
  addPermintaan
);

// Read All
router.get('/permintaan', getAllPermintaan);

// Read by ID
router.get('/permintaan/:kd_permintaan', getPermintaanById);

// Update
router.put(
  '/permintaan/:kd_permintaan',
  // authenticateToken,
  // checkRole("admin"),
  updatePermintaan
);

// Delete
router.delete(
  '/permintaan/:kd_permintaan',
  // authenticateToken,
  // checkRole("admin"),
  deletePermintaan
);

export default router;
