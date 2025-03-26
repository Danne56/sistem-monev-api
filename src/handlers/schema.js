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
  role: Joi.string().valid("admin", "pengelola", "pengguna", "dinas").required().messages({
    "any.only": `"role" hanya boleh diisi dengan "admin", "pengelola", "pengguna", atau "dinas"`,
    "any.required": `"role" wajib diisi`,
  }),
});

module.exports = { registerSchema };
