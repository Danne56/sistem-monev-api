const pool = require("../config/db");

// Fungsi untuk logout
const logoutUser = async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Token tidak ditemukan",
    });
  }

  try {
    // Tambahkan token ke blacklist
    const insertQuery = "INSERT INTO token_blacklist (token) VALUES ($1)";
    await pool.query(insertQuery, [token]);

    return res.status(200).json({
      status: "success",
      message: "Logout berhasil",
    });
  } catch (err) {
    console.error("Error logging out user:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { logoutUser };