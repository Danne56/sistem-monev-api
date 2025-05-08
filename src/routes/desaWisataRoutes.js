const express = require("express");
const { addDesaWisata, getAllDesaWisata, getDesaWisataById, getDesaWisataByKategori, updateDesaWisata, deleteDesaWisata } = require("../handlers/desaWisataHandler");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/desa-wisata", authenticateToken, checkRole("pengelola"), addDesaWisata);

router.get("/desa-wisata", authenticateToken, getAllDesaWisata);

router.get("/desa-wisata/:kd_desa", authenticateToken, getDesaWisataById);

router.get("/desa-wisata/kategori/:kd_kategori_desa_wisata", authenticateToken, getDesaWisataByKategori);

router.put("/desa-wisata/:kd_desa", authenticateToken, checkRole("pengelola"), updateDesaWisata);

router.delete("/desa-wisata/:kd_desa", authenticateToken, checkRole("pengelola"), deleteDesaWisata);

module.exports = router;

