const express = require('express');
const multer = require('multer');
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const {
  addDeskripsiWisata,
  getAllDeskripsiWisata,
  getDeskripsiWisataByKdDesa,
  updateDeskripsiWisata,
  deleteDeskripsiWisata,
} = require("../handlers/deskripsiWisataHandler");

const router = express.Router();

// Multer setup with structured image fields
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Define the fields and their limits
const imageFields = [
  { name: 'atraksi', maxCount: 20 },
  { name: 'penginapan', maxCount: 20 },
  { name: 'paket_wisata', maxCount: 20 },
  { name: 'suvenir', maxCount: 20 }
];

// Middleware to handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      status: 'error', 
      message: `Upload error: ${err.message}` 
    });
  }
  next(err);
};

// GET all deskripsi wisata
router.get('/deskripsi-wisata', authenticateToken, getAllDeskripsiWisata);

// GET deskripsi wisata by kd_desa
router.get('/deskripsi-wisata/:kd_desa', authenticateToken, getDeskripsiWisataByKdDesa);

// POST create deskripsi wisata with multiple image uploads
router.post(
  '/deskripsi-wisata',
  authenticateToken,
  checkRole("pengelola"),
  upload.fields(imageFields),
  handleUploadErrors,
  addDeskripsiWisata
);

// PUT update deskripsi wisata with multiple image uploads
router.put(
  '/deskripsi-wisata/:kd_desa',
  authenticateToken,
  checkRole("pengelola"),
  upload.fields(imageFields),
  handleUploadErrors,
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