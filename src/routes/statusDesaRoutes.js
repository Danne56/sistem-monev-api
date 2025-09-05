const express = require('express');
const {
  addStatusDesa,
  getAllStatusDesa,
  getStatusDesaByKdStatus,
  updateStatusDesa,
  deleteStatusDesa,
} = require('../handlers/statusDesaHandler');
const {
  authenticateToken,
  checkRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create
router.post(
  '/status-desa',
  authenticateToken,
  checkRole('dinas'),
  addStatusDesa
);

// Read All
router.get('/status-desa', getAllStatusDesa);

// Read by kd_status
router.get(
  '/status-desa/:kd_status',
  authenticateToken,
  getStatusDesaByKdStatus
);

// Update
router.put(
  '/status-desa/:kd_status',
  authenticateToken,
  checkRole('dinas'),
  updateStatusDesa
);

// Delete
router.delete(
  '/status-desa/:kd_status',
  authenticateToken,
  checkRole('dinas'),
  deleteStatusDesa
);

module.exports = router;
