const Joi = require('joi');

/* ==============================
   Auth Schemas
   ============================== */

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    'string.base': `"fullName" harus berupa sebuah string`,
    'string.min': `"fullName" harus memiliki setidaknya 3 karakter`,
    'string.max': `"fullName" harus memiliki maksimal 50 karakter`,
    'any.required': `"fullName" wajib diisi`,
  }),
  email: Joi.string().email().required().messages({
    'string.base': `"email" harus berupa sebuah string`,
    'string.email': `"email" tidak valid`,
    'any.required': `"email" wajib diisi`,
  }),
  password: Joi.string().alphanum().min(6).required().messages({
    'string.alphanum': `"password" hanya boleh berisi huruf dan angka`,
    'string.base': `"password" harus berupa sebuah string`,
    'string.min': `"password" harus memiliki setidaknya 6 karakter`,
    'any.required': `"password" wajib diisi`,
  }),
  role: Joi.string()
    .valid('admin', 'pengelola', 'pengguna', 'dinas')
    .required()
    .messages({
      'any.only': `"role" hanya boleh diisi dengan "admin", "pengelola", "pengguna", atau "dinas"`,
      'any.required': `"role" wajib diisi`,
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': `"email" tidak valid`,
    'any.required': `"email" wajib diisi`,
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': `"password" wajib diisi`,
    'any.required': `"password" wajib diisi`,
  }),
});

/* ==============================
   Kategori Schema
   ============================== */

const kategoriSchema = Joi.object({
  nama_kategori: Joi.string().trim().max(100).required().messages({
    'string.base': `"Nama kategori harus berupa teks"`,
    'string.max': `"Nama kategori maksimal 100 karakter"`,
    'any.required': `"Nama kategori wajib diisi"`,
  }),
  nilai: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': `"Nilai harus berupa angka"`,
    'number.min': `"Nilai minimal adalah 0"`,
    'number.max': `"Nilai maksimal adalah 100"`,
    'any.required': `"Nilai wajib diisi"`,
  }),
});

/* ==============================
   Desa Wisata Schema
   ============================== */

const desaWisataSchema = Joi.object({
  provinsi: Joi.string().trim().max(100).required().messages({
    'string.base': `"Provinsi" harus berupa teks`,
    'string.max': `"Provinsi" maksimal 100 karakter`,
    'any.required': `"Provinsi" wajib diisi`,
  }),
  kabupaten: Joi.string().trim().max(100).required().messages({
    'string.base': `"Kabupaten" harus berupa teks`,
    'string.max': `"Kabupaten" maksimal 100 karakter`,
    'any.required': `"Kabupaten" wajib diisi`,
  }),
  nama_desa: Joi.string().trim().max(100).required().messages({
    'string.base': `"Nama desa" harus berupa teks`,
    'string.max': `"Nama desa" maksimal 100 karakter`,
    'any.required': `"Nama desa" wajib diisi`,
  }),
  nama_popular: Joi.string().trim().max(100).allow(null, '').messages({
    'string.base': `"Nama populer" harus berupa teks`,
    'string.max': `"Nama populer" maksimal 100 karakter`,
  }),
  alamat: Joi.string().required().messages({
    'string.base': `"Alamat" harus berupa teks`,
    'any.required': `"Alamat" wajib diisi`,
  }),
  pengelola: Joi.string().trim().max(100).required().messages({
    'string.base': `"Pengelola" harus berupa teks`,
    'string.max': `"Pengelola" maksimal 100 karakter`,
    'any.required': `"Pengelola" wajib diisi`,
  }),
  nomor_telepon: Joi.string().trim().max(20).required().messages({
    'string.base': `"Nomor telepon" harus berupa teks`,
    'string.max': `"Nomor telepon" maksimal 20 karakter`,
    'any.required': `"Nomor telepon" wajib diisi`,
  }),
  email: Joi.string().email().max(100).required().messages({
    'string.base': `"Email" harus berupa teks`,
    'string.email': `"Email" tidak valid`,
    'string.max': `"Email" maksimal 100 karakter`,
    'any.required': `"Email" wajib diisi`,
  }),
});

/* ==============================
   Status Desa Schema
   ============================== */

const createStatusDesaSchema = Joi.object({
  kd_desa: Joi.string().max(15).required().messages({
    'string.base': `"Kode desa" harus berupa teks`,
    'string.max': `"Kode desa" maksimal 10 karakter`,
    'any.required': `"Kode desa" wajib diisi`,
  }),
  status: Joi.string()
    .valid('aktif', 'perbaikan', 'tidak aktif', 'kurang terawat')
    .required()
    .messages({
      'string.empty': `"Status" tidak boleh kosong`,
      'string.base': `"Status" harus berupa teks`,
      'any.only': `"Status" hanya boleh diisi dengan "aktif", "perbaikan", "tidak aktif", atau "kurang terawat"`,
      'any.required': `"Status" wajib diisi`,
    }),
  keterangan: Joi.string().max(255).allow(null, '').messages({
    'string.base': `"Keterangan" harus berupa teks`,
    'string.max': `"Keterangan" maksimal 255 karakter`,
  }),
});

const updateStatusDesaSchema = Joi.object({
  status: Joi.string()
    .valid('aktif', 'perbaikan', 'tidak aktif', 'kurang terawat')
    .required()
    .messages({
      'string.empty': `"Status" tidak boleh kosong`,
      'string.base': `"Status" harus berupa teks`,
      'any.only': `"Status" hanya boleh diisi dengan "aktif", "perbaikan", "tidak aktif", atau "kurang terawat"`,
      'any.required': `"Status" wajib diisi`,
    }),
  keterangan: Joi.string().max(255).allow(null, '').messages({
    'string.base': `"Keterangan" harus berupa teks`,
    'string.max': `"Keterangan" maksimal 255 karakter`,
  }),
});

/* ==============================
   Item Schema (Reusable)
   ============================== */

// itemSchema removed as it was unused

// Schema untuk validasi entitas (atraksi, penginapan, dll.)
const entitySchema = Joi.object({
  nama: Joi.string().required().messages({
    'string.empty': 'Nama harus diisi',
    'any.required': 'Nama wajib diisi',
  }),
  deskripsi: Joi.string().required().messages({
    'string.empty': 'Deskripsi harus diisi',
    'any.required': 'Deskripsi wajib diisi',
  }),
  gambar: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Gambar harus berupa string',
  }),
  harga: Joi.number().allow(null).optional().messages({
    'number.base': 'Harga harus berupa angka',
  }),
  created_at: Joi.string().optional(),
  updated_at: Joi.string().optional(),
});

/* ==============================
   Deskripsi Wisata Schema
   ============================== */

const deskripsiWisataSchema = Joi.object({
  atraksi: Joi.array().items(entitySchema).default([]),
  penginapan: Joi.array().items(entitySchema).default([]),
  paket_wisata: Joi.array()
    .items(
      entitySchema.keys({
        harga: Joi.number().allow(null).required().messages({
          'number.base': 'Harga paket wisata harus berupa angka',
        }),
      })
    )
    .default([]),
  suvenir: Joi.array()
    .items(
      entitySchema.keys({
        harga: Joi.number().allow(null).required().messages({
          'number.base': 'Harga suvenir harus berupa angka',
        }),
      })
    )
    .default([]),
});

// Untuk POST /permintaan
const createPermintaanSchema = Joi.object({
  email: Joi.string().email().required(),
  kd_desa: Joi.string().required(),
});

// Untuk PUT /permintaan/:kd_permintaan
const updatePermintaanSchema = Joi.object({
  status_permintaan: Joi.string()
    .valid('diterima', 'diproses', 'selesai', 'ditolak')
    .required(),
});

//forgot password schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

//reset password schema
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  resetCode: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  kategoriSchema,
  desaWisataSchema,
  deskripsiWisataSchema,
  createPermintaanSchema,
  updatePermintaanSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createStatusDesaSchema,
  updateStatusDesaSchema,
};
