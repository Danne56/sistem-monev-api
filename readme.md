## **Instalasi**

1. **Clone Repository**:

   ```bash
   git clone https://github.com/Danne56/sistem-monev.git
   cd sistem-monev
   ```

2. **Instal Dependensi**:

   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   - Buat file `.env` di root proyek.
   - Salin konfigurasi dari file `.env-example` dan sesuaikan isinya.

4. **Setup Database**:
   - Pastikan PostgreSQL sudah terinstal dan database telah dibuat.
   - Jalankan script SQL berikut untuk membuat tabel-tabel yang diperlukan:

     ### **Tabel `users`**

     ```sql
     CREATE TABLE users (
         id SERIAL PRIMARY KEY,
         username VARCHAR(50) UNIQUE NOT NULL,
         full_name VARCHAR(100) NOT NULL,
         email VARCHAR(100) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         role VARCHAR(20) NOT NULL,
         is_verified BOOLEAN DEFAULT FALSE,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     ```

     ### **Tabel `email_verifications`**

     ```sql
     CREATE TABLE email_verifications (
         id SERIAL PRIMARY KEY,
         username VARCHAR(50) NOT NULL,
         full_name VARCHAR(100) NOT NULL,
         email VARCHAR(100) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         role VARCHAR(20) NOT NULL,
         verification_code VARCHAR(6) NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     ```

     ### **Tabel `kategori_desa_wisata`**

     ```sql
     CREATE TABLE kategori_desa_wisata (
         kd_kategori_desa_wisata VARCHAR(10) PRIMARY KEY,
         nama_kategori VARCHAR(100) NOT NULL,
         nilai INTEGER NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     ```

5. **Jalankan Aplikasi**:

   ```bash
   npm start
   ```

   Aplikasi akan berjalan di `http://localhost:5000`.

---

## **Penggunaan API**

### **Autentikasi**

#### **1. Registrasi Pengguna**

- **URL**: `POST /authentication/register`
- **Body**:

  ```json
  {
    "username": "user123",
    "fullName": "Nama Lengkap",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "dinas"
  }
  ```

- **Response**:

  ```json
  {
    "status": "success",
    "message": "Verification code has been sent to email"
  }
  ```

#### **2. Verifikasi Email**

- **URL**: `POST /authentication/verify`
- **Body**:

  ```json
  {
    "email": "user@example.com",
    "verificationCode": "123456"
  }
  ```

- **Response**:

  ```json
  {
    "status": "success",
    "message": "Akun berhasil diverifikasi"
  }
  ```

#### **3. Login Pengguna**

- **URL**: `POST /authentication/login`
- **Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Response**:

  ```json
  {
    "status": "success",
    "message": "Login berhasil",
    "token": "your_jwt_token"
  }
  ```

---

### **Kategori Desa Wisata**

#### **1. Tambah Kategori**

- **URL**: `POST /api/kategori`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

  ```json
  {
    "kd_kategori_desa_wisata": "KD001",
    "nama_kategori": "Kategori Baru",
    "nilai": 100
  }
  ```

- **Response**:

  ```json
  {
    "status": "success",
    "message": "Kategori desa wisata berhasil ditambahkan"
  }
  ```

#### **2. Dapatkan Semua Kategori**

- **URL**: `GET /api/kategori`
- **Response**:

  ```json
  {
    "status": "success",
    "data": [
      {
        "kd_kategori_desa_wisata": "KD001",
        "nama_kategori": "Kategori Baru",
        "nilai": 100
      }
    ]
  }
  ```

#### **3. Perbarui Kategori**

- **URL**: `PUT /api/kategori/:kd_kategori_desa_wisata`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

  ```json
  {
    "nama_kategori": "Kategori Diperbarui",
    "nilai": 200
  }
  ```

- **Response**:

  ```json
  {
    "status": "success",
    "message": "Kategori desa wisata berhasil diperbarui"
  }
  ```

#### **4. Hapus Kategori**

- **URL**: `DELETE /api/kategori/:kd_kategori_desa_wisata`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Response**:

  ```json
  {
    "status": "success",
    "message": "Kategori desa wisata berhasil dihapus"
  }
  ```
