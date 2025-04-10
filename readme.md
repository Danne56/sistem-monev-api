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

     ### **Tabel `desa_wisata`**

     ```sql
     CREATE TABLE desa_wisata (
         kd_desa VARCHAR(10) primary key,
         provinsi VARCHAR(50) NOT NULL,
         kabupaten VARCHAR(50) NOT NULL,
         nama_desa VARCHAR(50) NOT NULL,
         nama_popular VARCHAR(50),
         alamat TEXT,
         pengelola VARCHAR(50),
         nomor_telepon VARCHAR(20),
         email VARCHAR(50) NOT NULL,
         kd_kategori_desa_wisata VARCHAR(10) NOT NULL,
         foreign KEY (email) references users (email),
         foreign KEY (kd_kategori_desa_wisata) references kategori_desa_wisata (kd_kategori_desa_wisata)
     );
     ```

     ### **Tabel `permintaan`**

     ```sql
     create table permintaan (
         kd_permintaan TEXT primary key,
         email VARCHAR(50) not null,
         kd_desa VARCHAR(10) not null,
         status_permintaan VARCHAR(10) not null check (
            status_permintaan in ('diterima', 'diproses', 'selesai', 'ditolak')
         ),
         foreign KEY (email) references users (email),
         foreign KEY (kd_desa) references desa_wisata (kd_desa)
     );
     ```

     ### **Tabel `deskripsi_wisata`**

     ```sql
     CREATE TABLE deskripsi_wisata (
         kd_desa VARCHAR(10) NOT NULL,
         penjelasan_umum TEXT,
         fasilitas TEXT,
         dokumentasi_desa TEXT,
         gambar_atraksi TEXT,
         nama_atraksi VARCHAR(100),
         kategori_atraksi VARCHAR(50),
         gambar_penginapan TEXT,
         nama_penginapan VARCHAR(100),
         harga_penginapan NUMERIC(12,2),
         gambar_paket_wisata TEXT,
         nama_paket_wisata VARCHAR(100),
         harga_paket_wisata NUMERIC(12,2),
         gambar_suvenir TEXT,
         nama_suvenir VARCHAR(100),
         harga_suvenir NUMERIC(12,2),
         
         PRIMARY KEY (kd_desa),
         FOREIGN KEY (kd_desa) REFERENCES desa_wisata (kd_desa)
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
