const pool = require("../config/db");

const getKategoriDesa = (rata_rata) => {
    if (rata_rata > 90) {
        return "Mandiri";
    } else if (rata_rata >= 75 && rata_rata <= 90) {
        return "Maju";
    } else if (rata_rata >= 50 && rata_rata < 75) {
        return "Berkembang";
    } else {
        return "Rintisan";
    }
};

const addSkorDesaWisata = async (req, res) => {
    const {
        kd_desa,
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata,
    } = req.body;

    const scores = [
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata,
    ].map(score => Number(score));

    if (scores.some(score => isNaN(score) || score < 1 || score > 100)) {
        return res.status(400).json({
            status: "fail",
            message: "Semua nilai skor harus berupa angka antara 1 hingga 100.",
        });
    }
    console.log("Request Body:", req.body);
    console.log("Tipe data partisipasi_masyarakat:", typeof req.body.partisipasi_masyarakat);
    try {
        const checkDesaQuery = "SELECT 1 FROM desa_wisata WHERE kd_desa = $1";
        const checkDesaResult = await pool.query(checkDesaQuery, [kd_desa]);

        if (checkDesaResult.rows.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Desa tidak ditemukan di database.",
            });
        }

        const checkSkorQuery = "SELECT 1 FROM skor_desa_wisata WHERE kd_desa = $1";
        const checkSkorResult = await pool.query(checkSkorQuery, [kd_desa]);

        if (checkSkorResult.rows.length > 0) {
            return res.status(409).json({
                status: "fail",
                message: "Skor untuk desa ini sudah ada. Gunakan PUT untuk mengubahnya.",
            });
        }

        const total_skor = scores.reduce((sum, val) => sum + val, 0);
        const rata_rata = Math.round(total_skor / 6);
        const kategori_desa = getKategoriDesa(rata_rata);

        const query = `
      INSERT INTO skor_desa_wisata (
        kd_desa,
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await pool.query(query, [
            kd_desa,
            scores[0], // Use converted number values
            scores[1],
            scores[2],
            scores[3],
            scores[4],
            scores[5],
        ]);

        const data = result.rows[0];
        data.total_skor = total_skor;
        data.rata_rata = rata_rata;
        data.kategori_desa = kategori_desa;

        // Update the kategori_desa in desa_wisata table
        await pool.query(
    "UPDATE desa_wisata SET kategori_desa = $1 WHERE kd_desa = $2",
    [kategori_desa, kd_desa]
);

        return res.status(201).json({
            status: "success",
            data,
            total_skor,
            rata_rata,
            kategori_desa,
        });

    } catch (err) {
        console.error("Error adding skor desa wisata:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

const updateSkorDesaWisata = async (req, res) => {
    const { kd_desa } = req.params;
    const {
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata,
    } = req.body;

    console.log("PUT Request Body:", req.body);

    const scores = [
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata,
    ].map(score => Number(score)); // Convert all values to numbers

    console.log("Converted scores:", scores);

    if (scores.some(score => isNaN(score) || score < 1 || score > 100)) {
        return res.status(400).json({
            status: "fail",
            message: "Semua nilai skor harus berupa angka antara 1 hingga 100.",
        });
    }

    try {
        const checkSkorQuery = "SELECT 1 FROM skor_desa_wisata WHERE kd_desa = $1";
        const checkSkorResult = await pool.query(checkSkorQuery, [kd_desa]);

        if (checkSkorResult.rows.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Data skor tidak ditemukan.",
            });
        }
        const total_skor = scores.reduce((sum, val) => sum + val, 0);
        const rata_rata = Math.round(total_skor / 6);
        const kategori_desa = getKategoriDesa(rata_rata);

        const query = `
      UPDATE skor_desa_wisata SET
        partisipasi_masyarakat = $1,
        keragaman_paket_wisata = $2,
        akses_tempat_wisata = $3,
        keramahan_difabel = $4,
        fasilitas_tempat_wisata = $5,
        produk_tempat_wisata = $6
      WHERE kd_desa = $7
      RETURNING *
    `;
        const result = await pool.query(query, [
            scores[0], // Use converted number values
            scores[1],
            scores[2],
            scores[3],
            scores[4],
            scores[5],
            kd_desa,
        ]);

        const data = result.rows[0];
        data.total_skor = total_skor;
        data.rata_rata = rata_rata;
        data.kategori_desa = kategori_desa;

        // Update the kategori_desa in desa_wisata table
        await pool.query(
            "UPDATE desa_wisata SET kategori_desa = $1 WHERE kd_desa = $2",
            [kategori_desa, kd_desa]
        );

        return res.status(200).json({
            status: "success",
            data,
            total_skor,
            rata_rata,
            kategori_desa,
        });

    } catch (err) {
        console.error("Error updating skor desa wisata:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

const getAllSkorDesaWisata = async (req, res) => {
  try {
    const query = `
          SELECT s.*, d.nama_desa
          FROM skor_desa_wisata s
          JOIN desa_wisata d ON s.kd_desa = d.kd_desa
          ORDER BY s.kd_desa ASC`;

    const result = await pool.query(query);

    return res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching skor desa:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getSkorDesaWisataByID = async (req, res) => {
  const { kd_desa } = req.params;

  try {
    const query = `
          SELECT * FROM skor_desa_wisata
          WHERE kd_desa = $1`;

    const result = await pool.query(query, [kd_desa]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Skor desa tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching skor desa:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  addSkorDesaWisata,
  updateSkorDesaWisata,
  getAllSkorDesaWisata,
  getSkorDesaWisataByID,
};