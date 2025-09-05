const express = require('express');
const router = express.Router();
const {
  addPermintaan,
  getAllPermintaan,
  getPermintaanById,
  updatePermintaan,
  deletePermintaan,
} = require('../handlers/permintaanHandler');
const {
  authenticateToken,
  checkRole,
} = require('../middleware/authMiddleware');

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

module.exports = router;
