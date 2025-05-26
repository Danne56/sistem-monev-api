const pool = require("../config/db");

const checkOwnership = async (req, res, next) => {
  // 🔍 DEBUG: Log semua kemungkinan lokasi kd_desa
  console.log("=== DEBUG CHECKOWNERSHIP ===");
  console.log("req.params:", req.params);
  console.log("req.query:", req.query);
  console.log("req.body:", req.body);
  console.log("req.body.data type:", typeof req.body.data);
  console.log("req.body.data content:", req.body.data);

  let kd_desa = req.params.kd_desa || req.query.kd_desa;
  
  // Jika tidak ada di params/query, coba parse dari body.data (multipart)
  if (!kd_desa && req.body.data) {
    try {
      const parsedData = typeof req.body.data === 'string' 
        ? JSON.parse(req.body.data) 
        : req.body.data;
      
      console.log("Parsed data:", parsedData);
      kd_desa = parsedData.kd_desa;
      console.log("kd_desa from parsed data:", kd_desa);
    } catch (err) {
      console.log("Error parsing req.body.data:", err.message);
    }
  }
  
  // Fallback ke req.body.kd_desa untuk non-multipart
  if (!kd_desa) {
    kd_desa = req.body.kd_desa;
    console.log("kd_desa from req.body.kd_desa:", kd_desa);
  }

  console.log("Final kd_desa:", kd_desa);
  console.log("===============================");

  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(403).json({
      status: "fail",
      message: "Akses ditolak. Email tidak ditemukan dalam token.",
    });
  }

  if (!kd_desa) {
    return res.status(400).json({
      status: "fail",
      message: "Kode desa tidak ditemukan dalam request",
      debug: {
        params: req.params,
        query: req.query,
        body: req.body,
        bodyKeys: Object.keys(req.body)
      }
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