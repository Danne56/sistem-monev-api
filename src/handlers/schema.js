const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": `"username" hanya boleh berisi huruf dan angka`,
    "string.base": `"username" harus berupa sebuah string`,
    "string.min": `"username" harus memiliki setidaknya 3 karakter`,
    "string.max": `"username" harus memiliki maksimal 30 karakter`,
    "any.required": `"username" wajib diisi`,
  }),
  fullName: Joi.string().min(3).max(50).required().messages({
    "string.base": `"fullName" harus berupa sebuah string`,
    "string.min": `"fullName" harus memiliki setidaknya 3 karakter`,
    "string.max": `"fullName" harus memiliki maksimal 50 karakter`,
    "any.required": `"fullName" wajib diisi`,
  }),
  email: Joi.string().email().required().messages({
    "string.base": `"email" harus berupa sebuah string`,
    "string.email": `"email" tidak valid`,
    "any.required": `"email" wajib diisi`,
  }),
  password: Joi.string().alphanum().min(6).required().messages({
    "string.alphanum": `"password" hanya boleh berisi huruf dan angka`,
    "string.base": `"password" harus berupa sebuah string`,
    "string.min": `"password" harus memiliki setidaknya 6 karakter`,
    "any.required": `"password" wajib diisi`,
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": `"confirmPassword" harus sama dengan "password"`,
    "any.required": `"confirmPassword" wajib diisi`,
  }),
  role: Joi.string()
    .valid("admin", "pengelola", "pengguna", "dinas")
    .required()
    .messages({
      "any.only": `"role" hanya boleh diisi dengan "admin", "pengelola", "pengguna", atau "dinas"`,
      "any.required": `"role" wajib diisi`,
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": `"email" tidak valid`,
    "any.required": `"email" wajib diisi`,
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": `"password" wajib diisi`,
    "any.required": `"password" wajib diisi`,
  }),
});

const kategoriSchema = Joi.object({
  kd_kategori_desa_wisata: Joi.string().trim().max(10).required().messages({
    "string.base": `"Kode kategori harus berupa teks"`,
    "string.max": `"Kode kategori maksimal 10 karakter"`,
    "any.required": `"Kode kategori wajib diisi"`,
  }),
  nama_kategori: Joi.string().trim().max(100).required().messages({
    "string.base": "Nama kategori harus berupa teks",
    "string.max": "Nama kategori maksimal 100 karakter",
    "any.required": "Nama kategori wajib diisi",
  }),
  nilai: Joi.number().integer().min(0).max(100).required().messages({
    "number.base": "Nilai harus berupa angka",
    "number.min": "Nilai minimal adalah 0",
    "number.max": "Nilai maksimal adalah 100",
    "any.required": "Nilai wajib diisi",
  }),
});

const desaWisataSchema = Joi.object({
  kd_desa: Joi.string().max(10).required().messages({
    "string.base": `"Kode desa" harus berupa teks`,
    "string.max": `"Kode desa" maksimal 10 karakter`,
    "any.required": `"Kode desa" wajib diisi`,
  }),
  provinsi: Joi.string().max(100).required().messages({
    "string.base": `"Provinsi" harus berupa teks`,
    "string.max": `"Provinsi" maksimal 100 karakter`,
    "any.required": `"Provinsi" wajib diisi`,
  }),
  kabupaten: Joi.string().max(100).required().messages({
    "string.base": `"Kabupaten" harus berupa teks`,
    "string.max": `"Kabupaten" maksimal 100 karakter`,
    "any.required": `"Kabupaten" wajib diisi`,
  }),
  nama_desa: Joi.string().max(100).required().messages({
    "string.base": `"Nama desa" harus berupa teks`,
    "string.max": `"Nama desa" maksimal 100 karakter`,
    "any.required": `"Nama desa" wajib diisi`,
  }),
  nama_popular: Joi.string().max(100).allow(null, "").messages({
    "string.base": `"Nama populer" harus berupa teks`,
    "string.max": `"Nama populer" maksimal 100 karakter`,
  }),
  alamat: Joi.string().required().messages({
    "string.base": `"Alamat" harus berupa teks`,
    "any.required": `"Alamat" wajib diisi`,
  }),
  pengelola: Joi.string().max(100).required().messages({
    "string.base": `"Pengelola" harus berupa teks`,
    "string.max": `"Pengelola" maksimal 100 karakter`,
    "any.required": `"Pengelola" wajib diisi`,
  }),
  nomor_telepon: Joi.string().max(20).required().messages({
    "string.base": `"Nomor telepon" harus berupa teks`,
    "string.max": `"Nomor telepon" maksimal 20 karakter`,
    "any.required": `"Nomor telepon" wajib diisi`,
  }),
  email: Joi.string().email().max(100).required().messages({
    "string.base": `"Email" harus berupa teks`,
    "string.email": `"Email" tidak valid`,
    "string.max": `"Email" maksimal 100 karakter`,
    "any.required": `"Email" wajib diisi`,
  }),
  kd_kategori_desa_wisata: Joi.string().max(10).required().messages({
    "string.base": `"Kode kategori desa wisata" harus berupa teks`,
    "string.max": `"Kode kategori desa wisata" maksimal 10 karakter`,
    "any.required": `"Kode kategori desa wisata" wajib diisi`,
  }),
});

const deskripsiWisataSchema = Joi.object({
  kd_desa: Joi.string().required().messages({
    "string.base": `"Kode desa" harus berupa teks`,
    "any.required": `"Kode desa" wajib diisi`,
  }),
  penjelasan_umum: Joi.string().required().messages({
    "string.base": `"Penjelasan umum" harus berupa teks`,
    "any.required": `"Penjelasan umum" wajib diisi`,
  }),
  fasilitas: Joi.string().required().messages({
    "string.base": `"Fasilitas" harus berupa teks`,
    "any.required": `"Fasilitas" wajib diisi`,
  }),
  dokumentasi_desa: Joi.string().required().messages({
    "string.base": `"Dokumentasi desa" harus berupa teks`,
    "any.required": `"Dokumentasi desa" wajib diisi`,
  }),
  gambar_atraksi: Joi.string().required().messages({
    "string.base": `"Gambar atraksi" harus berupa teks`,
    "any.required": `"Gambar atraksi" wajib diisi`,
  }),
  nama_atraksi: Joi.string().required().messages({
    "string.base": `"Nama atraksi" harus berupa teks`,
    "any.required": `"Nama atraksi" wajib diisi`,
  }),
  kategori_atraksi: Joi.string().required().messages({
    "string.base": `"Kategori atraksi" harus berupa teks`,
    "any.required": `"Kategori atraksi" wajib diisi`,
  }),
  gambar_penginapan: Joi.string().required().messages({
    "string.base": `"Gambar penginapan" harus berupa teks`,
    "any.required": `"Gambar penginapan" wajib diisi`,
  }),
  nama_penginapan: Joi.string().required().messages({
    "string.base": `"Nama penginapan" harus berupa teks`,
    "any.required": `"Nama penginapan" wajib diisi`,
  }),
  harga_penginapan: Joi.number().integer().min(0).required().messages({
    "number.base": `"Harga penginapan" harus berupa angka`,
    "number.min": `"Harga penginapan minimal adalah 0`,
    "any.required": `"Harga penginapan" wajib diisi`,
  }),
  gambar_paket_wisata: Joi.string().required().messages({
    "string.base": `"Gambar paket wisata" harus berupa teks`,
    "any.required": `"Gambar paket wisata" wajib diisi`,
  }),
  nama_paket_wisata: Joi.string().required().messages({
    "string.base": `"Nama paket wisata" harus berupa teks`,
    "any.required": `"Nama paket wisata" wajib diisi`,
  }),
  harga_paket_wisata: Joi.number().integer().min(0).required().messages({
    "number.base": `"Harga paket wisata" harus berupa angka`,
    "number.min": `"Harga paket wisata minimal adalah 0`,
    "any.required": `"Harga paket wisata" wajib diisi`,
  }),
  gambar_suvenir: Joi.string().required().messages({
    "string.base": `"Gambar suvenir" harus berupa teks`,
    "any.required": `"Gambar suvenir" wajib diisi`,
  }),
  nama_suvenir: Joi.string().required().messages({
    "string.base": `"Nama suvenir" harus berupa teks`,
    "any.required": `"Nama suvenir" wajib diisi`,
  }),
  status: Joi.string()
    .valid("aktif", "perbaikan", "tidak aktif", "kurang terawat")
    .required()
    .messages({
      "string.base": `"Status" harus berupa teks`,
      "string.valid": `"Status" hanya boleh diisi dengan "aktif", "perbaikan", "tidak aktif", atau "kurang terawat"`,
      "any.only": `"Status" hanya boleh diisi dengan "aktif", "perbaikan", "tidak aktif", atau "kurang terawat"`,
      "any.required": `"Status" wajib diisi`,
    }),
  harga_suvenir: Joi.number().integer().min(0).required().messages({
    "number.base": `"Harga suvenir" harus berupa angka`,
    "number.min": `"Harga suvenir minimal adalah 0`,
    "any.required": `"Harga suvenir" wajib diisi`,
  }),
});

statusDesaSchema = Joi.object({
  kd_status: Joi.string().max(10).required().messages({
    "string.base": `"Kode status" harus berupa teks`,
    "string.max": `"Kode status" maksimal 10 karakter`,
    "any.required": `"Kode status" wajib diisi`,
  }),
  kd_desa: Joi.string().max(10).required().messages({
    "string.base": `"Kode desa" harus berupa teks`,
    "string.max": `"Kode desa" maksimal 10 karakter`,
    "any.required": `"Kode desa" wajib diisi`,
  }),
  status: Joi.string()
    .valid("aktif", "perbaikan", "tidak aktif", "kurang terawat")
    .required()
    .messages({
      "string.empty": `"Status" tidak boleh kosong.`,
      "string.base": `"Status" harus berupa teks.`,
      "any.only": `"Status" hanya boleh diisi dengan "aktif", "perbaikan", "tidak aktif", atau "kurang terawat".`,
      "any.required": `"Status" wajib diisi.`,
    }),
  keterangan: Joi.string().max(255).allow(null, "").messages({
    "string.base": `"Keterangan" harus berupa teks`,
    "string.max": `"Keterangan" maksimal 255 karakter`,
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  kategoriSchema,
  desaWisataSchema,
  deskripsiWisataSchema,
  statusDesaSchema,
};
