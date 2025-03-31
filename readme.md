## **Instalasi**

1. **Clone Repository**:

   ```bash
   git clone https://github.com/Danne56/sistem-monev-api.git
   cd sistem-monev-api
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

## **Dokumentasi API**

API ini didokumentasikan menggunakan **OpenAPI (Swagger)**. Anda dapat mengakses dokumentasi interaktif melalui Swagger UI.

### **Cara Mengakses Dokumentasi**

- Setelah menjalankan aplikasi, buka browser dan akses URL berikut:

   ```bash
   http://localhost:5000/api-docs
   ```
