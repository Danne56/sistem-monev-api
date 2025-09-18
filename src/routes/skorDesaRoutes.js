import express from 'express';
import {
  addSkorDesaWisata,
  getAllSkorDesaWisata,
  getSkorDesaWisataByID,
  updateSkorDesaWisata,
} from '../handlers/skorDesaHandler.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/skor', authenticateToken, checkRole('dinas'), addSkorDesaWisata);
router.put(
  '/skor/:kd_desa',
  authenticateToken,
  checkRole('dinas'),
  updateSkorDesaWisata
);
router.get('/skor', getAllSkorDesaWisata);
router.get('/skor/:kd_desa', getSkorDesaWisataByID);

export default router;
