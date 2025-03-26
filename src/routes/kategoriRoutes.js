const express = require("express");
const { addKategoriDesaWisata } = require("../handlers/kategoriHandler");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/kategori", authenticateToken, addKategoriDesaWisata);

module.exports = router;