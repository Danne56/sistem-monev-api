const express = require("express");
const { registerUser } = require("../handlers/userHandler");
const { verifyAccount } = require("../handlers/verifyAccountHandler");
const { loginUser } = require("../handlers/loginHandler");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyAccount);
router.post("/login", loginUser);

// Hanya di development
if (process.env.NODE_ENV === "development") {
  router.post("/mock-login", (req, res) => {
    // Data user dummy
    const mockUser = {
      id: 999,
      username: "dev_admin",
      role: "dinas",
      email: "dev@example.com",
    };

    // Generate token (gunakan secret key development)
    const token = jwt.sign(
      mockUser,
      process.env.JWT_SECRET_DEV || "dev-secret"
    );

    res.json({
      status: "success",
      token,
      user: mockUser,
    });
  });
}

module.exports = router;
