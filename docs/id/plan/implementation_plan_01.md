# Rencana Implementasi: Pembersihan Massal Aset imgix Menggunakan Node.js & TypeScript

Rencana ini menjelaskan desain dan implementasi skrip CLI Node.js + TypeScript untuk mengambil semua aset secara otomatis dari Source imgix dan membersihkannya dengan pembatasan laju permintaan (rate-limited).

## Rekomendasi Stack Teknologi

Kami merekomendasikan penggunaan **Node.js + TypeScript** (dijalankan via `tsx` untuk runtime tanpa kompilasi) karena:
1. Ruang kerja telah diinisialisasi dengan `pnpm init` dan `package.json`.
2. TypeScript memberikan keamanan tipe data yang kuat saat memetakan respons JSON dari imgix Management API.
3. Node.js memiliki kontrol alur asinkron yang tangguh, yang sangat penting untuk membatasi permintaan dalam batas laju **4 permintaan per detik** dari imgix.

---

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Izin Kunci API**: Anda harus memastikan kunci API Anda (saat ini ditempatkan di `.env.local`) memiliki izin `Asset Manager Browse` dan `Purge`.
> - **Persyaratan ID Source**: Anda perlu mendapatkan **Source ID** Anda dari dashboard imgix dan menambahkannya ke `.env.local` sebagai `IMGIX_SOURCE_ID`.
> - **Peringatan Kehilangan Data**: Skrip ini akan menghapus cache untuk semua gambar yang terdaftar di bawah Source ini. Karena bucket asal Cloudflare R2 Anda sudah dihapus, gambar yang dibersihkan akan mengembalikan error 404 permanen dan tidak dapat dipulihkan kecuali diunggah kembali ke bucket asal yang baru.

---

## Pertanyaan Terbuka

> [!NOTE]
> 1. Apakah Anda lebih menyukai mode dry-run yang mencantumkan semua aset yang akan dibersihkan sebelum menjalankan permintaan pembersihan yang sebenarnya?
> 2. Apakah ada jalur folder atau ekstensi file tertentu yang ingin Anda kecualikan dari proses pembersihan, atau Anda ingin membersihkan semuanya di bawah Source?

---

## Rencana Perubahan

### Konfigurasi dan Dependensi

#### [MODIFY] [package.json](../../../package.json)
- Tambahkan devDependencies yang diperlukan: `typescript`, `@types/node`, `tsx`, `dotenv`.
- Tambahkan entri skrip: `"purge": "tsx src/purge.ts"`.

#### [NEW] [tsconfig.json](../../../tsconfig.json)
- Siapkan konfigurasi TypeScript dasar yang cocok untuk Node.js ES Modules.

#### [MODIFY] [.env.example](../../../.env.example)
- Perbarui untuk menyertakan `IMGIX_SOURCE_ID`.

---

### Implementasi Inti

#### [NEW] [purge.ts](../../../src/purge.ts)
- Implementasikan skrip yang:
  - Memuat variabel lingkungan dari `.env.local`.
  - Memvalidasi keberadaan `IMGIX_API_KEY` dan `IMGIX_SOURCE_ID`.
  - Mengimplementasikan paginasi menggunakan `GET https://api.imgix.com/api/v1/sources/:source_id/assets?page[number]=N&page[size]=100`.
  - Membatasi permintaan hingga maksimum 3 permintaan per detik untuk menghindari error `429 Too Many Requests`.
  - Mengirimkan `POST https://api.imgix.com/api/v1/purge` untuk setiap aset.
  - Mencetak log status yang jelas ke konsol yang menunjukkan kemajuan.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Menjalankan skrip dengan opsi dry-run untuk mencatat tindakan tanpa memanggil POST API yang sebenarnya.

### Verifikasi Manual
- Pengujian dengan satu aset tiruan terlebih dahulu sebelum dijalankan pada semua aset.
- Memeriksa kode respons HTTP (200 OK untuk pembersihan yang berhasil, 429 untuk masalah batas laju).
