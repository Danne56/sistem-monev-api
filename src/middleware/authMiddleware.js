const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Ambil token dari header
  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Akses ditolak. Token tidak ditemukan.",
    });
  }

  try {
    // Gunakan secret sesuai environment
    const secret =
      process.env.NODE_ENV === "development"
        ? process.env.JWT_SECRET_DEV
        : process.env.JWT_SECRET;

    const verified = jwt.verify(token, secret);
    req.user = verified; // Simpan informasi user ke `req`
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ status: "fail", message: "Token tidak valid" });
  }
};

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // Skip role check in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Skipping role check for ${requiredRole}`);
      return next();
    }

    // Proceed with role check in production
    const userRole = req.user.role;
    if (userRole !== requiredRole) {
      return res.status(403).json({
        status: "fail",
        message: `Hanya role ${requiredRole} yang dapat mengakses endpoint ini.`,
      });
    }
    next();
  };
};

module.exports = { authenticateToken, checkRole };