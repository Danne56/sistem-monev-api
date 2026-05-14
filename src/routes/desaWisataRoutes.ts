import express from 'express';
import {
  addDesaWisata,
  deleteDesaWisata,
  getAllDesaWisata,
  getAllDesaWisataWithDetails,
  getDesaByUserEmail,
  getDesaWisataById,
  getDesaWisataBySlug,
  updateDesaWisata,
} from '../handlers/desaWisataHandler.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/desa-wisata', addDesaWisata);
router.get('/desa-wisata', getAllDesaWisata);
router.get('/desa-wisata/details', getAllDesaWisataWithDetails);
router.get('/desa-wisata/:kd_desa', getDesaWisataById);

router.put(
  '/desa-wisata/:kd_desa',
  authenticateToken,
  checkRole('pengelola'),
  updateDesaWisata
);

router.delete(
  '/desa-wisata/:kd_desa',
  authenticateToken,
  checkRole('pengelola'),
  deleteDesaWisata
);

router.get('/desa-wisata/email/:email', getDesaByUserEmail);

router.get('/desa-wisata/slug/:slug', getDesaWisataBySlug);

export default router;
