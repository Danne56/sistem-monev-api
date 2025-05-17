const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const {
  addSkorDesaWisata,
  updateSkorDesaWisata,
  getAllSkorDesaWisata,
} = require("../handlers/skorDesaHandler");

router.post("/skor", authenticateToken, checkRole("dinas"), addSkorDesaWisata);
router.put(
  "/skor/:kd_desa",
  authenticateToken,
  checkRole("dinas"),
  updateSkorDesaWisata
);
router.get("/skor", getAllSkorDesaWisata);
router.get("/skor/:kd_desa", getAllSkorDesaWisata);

module.exports = router;