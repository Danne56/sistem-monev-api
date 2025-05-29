const express = require("express");
const { getAllUsers
} = require("../handlers/userHandler");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", authenticateToken, checkRole("admin"), getAllUsers);

module.exports = router;