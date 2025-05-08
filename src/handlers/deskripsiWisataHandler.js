const pool = require("../config/db");
const { deskripsiWisataSchema } = require("../handlers/schema");
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Setup GCP Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.BUCKET_NAME);

// File size and type validation for Multer
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
  
  // Check for specific image formats
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Hanya format JPG, PNG, dan WebP yang diperbolehkan!'), false);
  }
  
  cb(null, true);
};

// Multer setup with validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: fileFilter
});

// Error handling middleware for file uploads
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: "fail",
        message: "Ukuran file terlalu besar. Maksimal 5MB."
      });
    }
    return res.status(400).json({
      status: "fail",
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
  next();
};

// Fungsi upload gambar ke GCS dan ambil URL publik
const uploadImageToGCS = async (file) => {
  try {
    // Create unique filename to avoid conflicts
    const fileName = `wisata/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const blob = bucket.file(fileName);
    
    // Create a write stream with metadata
    const blobStream = blob.createWriteStream({
      resumable: false,
      public: true,
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
    });

    // Return a promise that resolves with the public URL
    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Upload error:', err);
        reject(new Error('Upload gambar gagal'));
      });
      
      blobStream.on('finish', () => {
        // Get the public URL
        const publicUrl = `${process.env.BUCKET_URL}/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });
      
      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error('Gagal mengupload gambar');
  }
};

// Helper function to handle arrays of entities with their images
const processEntityWithImages = async (entities = [], files = [], existingEntities = []) => {
  const results = [];
  
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    let imageUrl = entity.gambar || null; // Keep existing URL if present
    
    // Check if a new file is provided for this entity
    if (files && files[i]) {
      try {
        // Upload new image and get URL
        imageUrl = await uploadImageToGCS(files[i]);
      } catch (error) {
        console.error(`Error processing image for entity ${i}:`, error);
      }
    } else if (!imageUrl && existingEntities && existingEntities[i]) {
      // If no new file and no URL in entity, but there's an existing entity with an image
      imageUrl = existingEntities[i].gambar;
    }
    
    // Set the image URL
    entity.gambar = imageUrl;
    
    // Add created/updated timestamp
    entity.updated_at = new Date().toISOString();
    if (!entity.created_at) {
      entity.created_at = new Date().toISOString();
    }
    
    results.push(entity);
  }
  
  return results;
};

// Tambah deskripsi wisata
const addDeskripsiWisata = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    // Ensure we have body data
    if (!req.body || !req.body.data) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Data tidak ditemukan dalam request"
      });
    }
    
    // Parse JSON data
    let data;
    try {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (err) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Format data tidak valid. Pastikan data dalam format JSON yang benar." 
      });
    }
    
    const {
      kd_desa,
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      atraksi = [],
      penginapan = [],
      paket_wisata = [],
      suvenir = [],
    } = data;

    // Ensure kd_desa exists
    if (!kd_desa) {
      return res.status(400).json({ 
        status: "fail", 
        message: "kd_desa tidak boleh kosong" 
      });
    }

    // Validate data
    const { error } = deskripsiWisataSchema.validate({
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      atraksi,
      penginapan,
      paket_wisata,
      suvenir,
    });

    if (error) {
      return res.status(400).json({ 
        status: "fail", 
        message: error.details[0].message 
      });
    }
    
    // Check if files are provided
    const files = {
      atraksi: req.files?.atraksi || [],
      penginapan: req.files?.penginapan || [],
      paket_wisata: req.files?.paket_wisata || [],
      suvenir: req.files?.suvenir || [],
    };

    // Begin transaction
    await client.query("BEGIN");

    // Check if deskripsi already exists for this kd_desa
    const checkExisting = await client.query(
      "SELECT 1 FROM deskripsi_wisata WHERE kd_desa = $1", 
      [kd_desa]
    );

    if (checkExisting.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        status: "fail", 
        message: "Deskripsi wisata untuk desa ini sudah ada. Gunakan endpoint update." 
      });
    }

    // Check if kd_desa exists in desa_wisata table
    const checkDesa = await client.query(
      "SELECT 1 FROM desa_wisata WHERE kd_desa = $1", 
      [kd_desa]
    );

    if (checkDesa.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        status: "fail", 
        message: "Kode desa tidak ditemukan dalam tabel desa_wisata." 
      });
    }

    // Process entities with images
    const atraksiWithImages = await processEntityWithImages(atraksi, files.atraksi);
    const penginapanWithImages = await processEntityWithImages(penginapan, files.penginapan);
    const paketWisataWithImages = await processEntityWithImages(paket_wisata, files.paket_wisata);
    const suvenirWithImages = await processEntityWithImages(suvenir, files.suvenir);

    // Insert query
    const insertQuery = `
      INSERT INTO deskripsi_wisata (
        kd_desa, penjelasan_umum, fasilitas, dokumentasi_desa,
        atraksi, penginapan, paket_wisata, suvenir, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      kd_desa,
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      JSON.stringify(atraksiWithImages),
      JSON.stringify(penginapanWithImages),
      JSON.stringify(paketWisataWithImages),
      JSON.stringify(suvenirWithImages),
    ]);

    await client.query("COMMIT");
    
    return res.status(201).json({ 
      status: "success", 
      message: "Deskripsi wisata berhasil ditambahkan",
      data: {
        id: result.rows[0].id,
        kd_desa
      }
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    console.error("Error adding deskripsi wisata:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Ambil semua deskripsi wisata
const getAllDeskripsiWisata = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    // Check if we should join with desa_wisata table for more info
    const withDesa = req.query.with_desa === 'true';
    
    let query = "SELECT * FROM deskripsi_wisata";
    if (withDesa) {
      query = `
        SELECT dw.*, d.nama_desa, d.lokasi, d.deskripsi_singkat
        FROM deskripsi_wisata dw
        JOIN desa_wisata d ON dw.kd_desa = d.kd_desa
      `;
    }
    
    // Add pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure valid page number
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100); // Limit between 1-100
    const offset = (page - 1) * limit;
    
    // Add pagination to query
    const paginatedQuery = `${query} LIMIT $1 OFFSET $2`;
    
    // Get total count
    const countResult = await client.query(`SELECT COUNT(*) FROM deskripsi_wisata`);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get paginated results
    const result = await client.query(paginatedQuery, [limit, offset]);
    
    return res.status(200).json({ 
      status: "success", 
      data: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching all deskripsi wisata:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Ambil berdasarkan kd_desa
const getDeskripsiWisataByKdDesa = async (req, res) => {
  const { kd_desa } = req.params;
  let client;
  
  try {
    client = await pool.connect();
    
    // Check if we should join with desa_wisata table for more info
    const withDesa = req.query.with_desa === 'true';
    
    let query = "SELECT * FROM deskripsi_wisata WHERE kd_desa = $1";
    if (withDesa) {
      query = `
        SELECT dw.*, d.nama_desa, d.lokasi, d.deskripsi_singkat
        FROM deskripsi_wisata dw
        JOIN desa_wisata d ON dw.kd_desa = d.kd_desa
        WHERE dw.kd_desa = $1
      `;
    }
    
    const result = await client.query(query, [kd_desa]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "fail", message: "Deskripsi wisata tidak ditemukan" });
    }
    
    return res.status(200).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching deskripsi wisata:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Perbarui deskripsi wisata
const updateDeskripsiWisata = async (req, res) => {
  const { kd_desa } = req.params;
  let client;
  
  try {
    client = await pool.connect();
    
    // Ensure we have body data
    if (!req.body || !req.body.data) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Data tidak ditemukan dalam request"
      });
    }
    
    // Parse JSON data
    let data;
    try {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (err) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Format data tidak valid. Pastikan data dalam format JSON yang benar." 
      });
    }
    
    const {
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      atraksi = [],
      penginapan = [],
      paket_wisata = [],
      suvenir = [],
    } = data;

    // Validate data
    const { error } = deskripsiWisataSchema.validate({
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      atraksi,
      penginapan,
      paket_wisata,
      suvenir,
    });

    if (error) {
      return res.status(400).json({ status: "fail", message: error.details[0].message });
    }

    // Begin transaction
    await client.query("BEGIN");

    // Check if deskripsi exists
    const checkExisting = await client.query(
      "SELECT * FROM deskripsi_wisata WHERE kd_desa = $1", 
      [kd_desa]
    );

    if (checkExisting.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        status: "fail", 
        message: "Deskripsi wisata tidak ditemukan" 
      });
    }
    
    // Get existing data to preserve image URLs if needed
    const existingData = checkExisting.rows[0];
    
    // Check if files are provided
    const files = {
      atraksi: req.files?.atraksi || [],
      penginapan: req.files?.penginapan || [],
      paket_wisata: req.files?.paket_wisata || [],
      suvenir: req.files?.suvenir || [],
    };

    // Process entities with both new images and existing data
    const atraksiWithImages = await processEntityWithImages(
      atraksi, 
      files.atraksi, 
      existingData.atraksi
    );
    
    const penginapanWithImages = await processEntityWithImages(
      penginapan, 
      files.penginapan, 
      existingData.penginapan
    );
    
    const paketWisataWithImages = await processEntityWithImages(
      paket_wisata, 
      files.paket_wisata, 
      existingData.paket_wisata
    );
    
    const suvenirWithImages = await processEntityWithImages(
      suvenir, 
      files.suvenir, 
      existingData.suvenir
    );

    // Update query
    const updateQuery = `
      UPDATE deskripsi_wisata SET
        penjelasan_umum = $1,
        fasilitas = $2,
        dokumentasi_desa = $3,
        atraksi = $4,
        penginapan = $5,
        paket_wisata = $6,
        suvenir = $7,
        updated_at = NOW()
      WHERE kd_desa = $8
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      penjelasan_umum,
      fasilitas,
      dokumentasi_desa,
      JSON.stringify(atraksiWithImages),
      JSON.stringify(penginapanWithImages),
      JSON.stringify(paketWisataWithImages),
      JSON.stringify(suvenirWithImages),
      kd_desa,
    ]);

    await client.query("COMMIT");
    
    return res.status(200).json({ 
      status: "success", 
      message: "Deskripsi wisata berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    console.error("Error updating deskripsi wisata:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Hapus deskripsi wisata
const deleteDeskripsiWisata = async (req, res) => {
  const { kd_desa } = req.params;
  let client;
  
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Check if exists and delete
    const result = await client.query(
      "DELETE FROM deskripsi_wisata WHERE kd_desa = $1 RETURNING *", 
      [kd_desa]
    );
    
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        status: "fail", 
        message: "Deskripsi wisata tidak ditemukan" 
      });
    }

    // Note: In a production environment, you might also want to delete the associated images
    // from Google Cloud Storage to free up storage

    await client.query("COMMIT");
    
    return res.status(200).json({ 
      status: "success", 
      message: "Deskripsi wisata berhasil dihapus" 
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    console.error("Error deleting deskripsi wisata:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  addDeskripsiWisata,
  getAllDeskripsiWisata,
  getDeskripsiWisataByKdDesa,
  updateDeskripsiWisata,
  deleteDeskripsiWisata,
  upload, // Untuk digunakan di routes
  handleUploadErrors, // Error handling middleware for file uploads
};