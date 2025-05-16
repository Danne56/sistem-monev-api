const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const {
    addSkorDesaWisata,
    updateSkorDesaWisata,
} = require("../handlers/skorDesaHandler");

router.post("/skor", authenticateToken,checkRole ("dinas"),addSkorDesaWisata);
router.put("/skor/:kd_desa", authenticateToken,checkRole ("dinas"), updateSkorDesaWisata);

module.exports = router;