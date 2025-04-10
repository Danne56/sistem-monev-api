const express = require("express");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const {
  addDeskripsiWisata,
  getAllDeskripsiWisata,
  getDeskripsiWisataByKdDesa,
  updateDeskripsiWisata,
  deleteDeskripsiWisata,
} = require("../handlers/deskripsiWisataHandler");

const router = express.Router();

router.post("/deskripsi-wisata", authenticateToken, checkRole("pengelola"), addDeskripsiWisata);

router.get("/deskripsi-wisata", authenticateToken, getAllDeskripsiWisata);

router.get("/deskripsi-wisata/:kd_desa", authenticateToken, getDeskripsiWisataByKdDesa);

router.put("/deskripsi-wisata/:kd_desa", authenticateToken, checkRole("pengelola"), updateDeskripsiWisata);

router.delete("/deskripsi-wisata/:kd_desa", authenticateToken, checkRole("pengelola"), deleteDeskripsiWisata);

module.exports = router;