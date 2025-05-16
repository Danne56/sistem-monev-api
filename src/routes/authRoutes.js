const express = require("express");
const { registerUser } = require("../handlers/userHandler");
const { verifyAccount } = require("../handlers/verifyAccountHandler");
const { loginUser } = require("../handlers/loginHandler");
const { authenticateToken } = require("../middleware/authMiddleware");
const { forgotPassword } = require("../handlers/forgotPasswordHandler");
const { resetPassword } = require("../handlers/resetPasswordHandler");
const { logoutUser } = require("../handlers/logoutHandler");
const { checkTokenBlacklist } = require("../middleware/checkTokenBlacklist");
const { checkRole } = require("../middleware/authMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password", forgotPassword);
router.put("/password", resetPassword);
router.post("/logout", authenticateToken, checkTokenBlacklist, logoutUser);
router.put("/verify/:email", authenticateToken, checkRole("admin"), verifyAccount);
router.get("/me", authenticateToken, verifyToken);

// Hanya di development
if (process.env.NODE_ENV === "development") {
  router.post("/mock-login", (req, res) => {
    // Data user dummy
    const mockUser = {
      id: 999,
      username: "dev_admin",
      role: "admin",
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