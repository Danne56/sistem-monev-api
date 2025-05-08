const express = require('express');
const {
  addDeskripsiWisata,
  getAllDeskripsiWisata,
  getDeskripsiWisataByKdDesa,
  updateDeskripsiWisata,
  deleteDeskripsiWisata,
  upload, // Import the upload middleware from handler
  handleUploadErrors // Import the error handler from handler
} = require("../handlers/deskripsiWisataHandler");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Define the fields and their limits for file uploads
const imageFields = [
  { name: 'atraksi', maxCount: 10 },
  { name: 'penginapan', maxCount: 10 },
  { name: 'paket_wisata', maxCount: 10 },
  { name: 'suvenir', maxCount: 10 }
];

// GET all deskripsi wisata
router.get('/deskripsi-wisata', authenticateToken, getAllDeskripsiWisata);

// GET deskripsi wisata by kd_desa
router.get('/deskripsi-wisata/:kd_desa', authenticateToken, getDeskripsiWisataByKdDesa);

// POST create deskripsi wisata with multiple image uploads
router.post(
  '/deskripsi-wisata',
  authenticateToken,
  checkRole("pengelola"),
  handleUploadErrors, // Use error handler from handler
  upload.fields(imageFields), // Use upload from handler
  addDeskripsiWisata
);

// PUT update deskripsi wisata with multiple image uploads
router.put(
  '/deskripsi-wisata/:kd_desa',
  authenticateToken,
  checkRole("pengelola"),
  handleUploadErrors, // Use error handler from handler
  upload.fields(imageFields), // Use upload from handler
  updateDeskripsiWisata
);

// DELETE deskripsi wisata
router.delete(
  '/deskripsi-wisata/:kd_desa', 
  authenticateToken, 
  checkRole("pengelola"), 
  deleteDeskripsiWisata
);

module.exports = router;