const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Ambil token dari header
  if (!token) {
    return res.status(401).json({ status: "fail", message: "Akses ditolak. Token tidak ditemukan." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Simpan informasi user ke `req`
    next();
  } catch (err) {
    return res.status(403).json({ status: "fail", message: "Token tidak valid" });
  }
};

module.exports = { authenticateToken };
