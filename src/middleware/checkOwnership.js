const checkOwnership = async (req, res, next) => {
  const { kd_desa } = req.params;
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(403).json({
      status: "fail",
      message: "Akses ditolak. Email tidak ditemukan dalam token.",
    });
  }

  try {
    // Cek apakah desa ini milik pengguna yang login
    const query = "SELECT email FROM desa_wisata WHERE kd_desa = $1";
    const result = await pool.query(query, [kd_desa]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Desa wisata tidak ditemukan",
      });
    }

    const ownerEmail = result.rows[0].email;

    if (ownerEmail !== userEmail) {
      return res.status(403).json({
        status: "fail",
        message: "Hanya pemilik desa yang bisa mengedit deskripsi wisata",
      });
    }

    next();
  } catch (err) {
    console.error("Error checking ownership:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { checkOwnership };
