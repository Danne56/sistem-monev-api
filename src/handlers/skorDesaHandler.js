const pool = require("../config/db");

// Menambahkan skor desa wisata (POST)
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

    // Validasi semua nilai adalah integer antara 1 - 100
    const scores = [
        partisipasi_masyarakat,
        keragaman_paket_wisata,
        akses_tempat_wisata,
        keramahan_difabel,
        fasilitas_tempat_wisata,
        produk_tempat_wisata,
    ].map(score => Number(score)); // Convert values to numbers

    if (scores.some(score => isNaN(score) || score < 1 || score > 100)) {
        return res.status(400).json({
            status: "fail",
            message: "Semua nilai skor harus berupa angka antara 1 hingga 100.",
        });
    }
    console.log("Request Body:", req.body);
    console.log("Tipe data partisipasi_masyarakat:", typeof req.body.partisipasi_masyarakat);
    try {
        // Cek apakah desa ada di tabel desa_wisata
        const checkDesaQuery = "SELECT 1 FROM desa_wisata WHERE kd_desa = $1";
        const checkDesaResult = await pool.query(checkDesaQuery, [kd_desa]);

        if (checkDesaResult.rows.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Desa tidak ditemukan di database.",
            });
        }

        // Cek apakah skor sudah ada
        const checkSkorQuery = "SELECT 1 FROM skor_desa_wisata WHERE kd_desa = $1";
        const checkSkorResult = await pool.query(checkSkorQuery, [kd_desa]);

        if (checkSkorResult.rows.length > 0) {
            return res.status(409).json({
                status: "fail",
                message: "Skor untuk desa ini sudah ada. Gunakan PUT untuk mengubahnya.",
            });
        }

        // Hitung total dan rata-rata
        const total_skor = scores.reduce((sum, val) => sum + val, 0);
        const rata_rata = Math.round(total_skor / 6);

        // Simpan data ke database
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

        return res.status(201).json({
            status: "success",
            data,
            total_skor,
            rata_rata,
        });

    } catch (err) {
        console.error("Error adding skor desa wisata:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

// Memperbarui skor desa wisata (PUT)
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
    
    // Convert string values to numbers and validate
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
        // Cek apakah skor ada
        const checkSkorQuery = "SELECT 1 FROM skor_desa_wisata WHERE kd_desa = $1";
        const checkSkorResult = await pool.query(checkSkorQuery, [kd_desa]);

        if (checkSkorResult.rows.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Data skor tidak ditemukan.",
            });
        }

        // Hitung total dan rata-rata
        const total_skor = scores.reduce((sum, val) => sum + val, 0);
        const rata_rata = Math.round(total_skor / 6);

        // Update data di database
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

        return res.status(200).json({
            status: "success",
            data,
            total_skor,
            rata_rata,
        });

    } catch (err) {
        console.error("Error updating skor desa wisata:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

module.exports = {
    addSkorDesaWisata,
    updateSkorDesaWisata,
};