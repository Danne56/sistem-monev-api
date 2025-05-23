const express = require("express");
const {
  addDesaWisata,
  getAllDesaWisata,
  getDesaWisataById,
  getDesaWisataByKategori,
  updateDesaWisata,
  deleteDesaWisata,
  getDesaByUserEmail,
} = require("../handlers/desaWisataHandler");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/desa-wisata", addDesaWisata);
router.get("/desa-wisata", getAllDesaWisata);
router.get("/desa-wisata/:kd_desa", getDesaWisataById);

router.get(
  "/desa-wisata/kategori/:kd_kategori_desa_wisata",
  getDesaWisataByKategori
);

router.put(
  "/desa-wisata/:kd_desa",
  authenticateToken,
  checkRole("pengelola"),
  updateDesaWisata
);

router.delete(
  "/desa-wisata/:kd_desa",
  authenticateToken,
  checkRole("pengelola"),
  deleteDesaWisata
);

router.get("/desa-wisata/email/:email", getDesaByUserEmail);

module.exports = router;
