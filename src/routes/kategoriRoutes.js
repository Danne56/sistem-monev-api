const express = require("express");
const { addKategoriDesaWisata, getAllKategoriDesaWisata, updateKategoriDesaWisata, deleteKategoriDesaWisata,} = require("../handlers/kategoriHandler");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/kategori", authenticateToken, checkRole("dinas"), addKategoriDesaWisata);
router.get("/kategori", getAllKategoriDesaWisata);
router.put("/kategori/:kd_kategori_desa_wisata", authenticateToken, checkRole("dinas"), updateKategoriDesaWisata);
router.delete("/kategori/:kd_kategori_desa_wisata", authenticateToken, checkRole("dinas"), deleteKategoriDesaWisata);

module.exports = router;