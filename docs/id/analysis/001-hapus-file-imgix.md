# Analisis Penghapusan File di imgix Asset Manager

Dokumen ini menjelaskan mengapa opsi hapus file tidak ditemukan di dashboard imgix, kondisi aset saat origin storage (Cloudflare R2) dihapus, serta langkah-langkah penanganan yang perlu dilakukan.

---

## 1. Mengapa Opsi "Hapus File" Tidak Ada di imgix?

imgix berfungsi sebagai **CDN/Proxy gambar secara real-time**, bukan sebagai tempat penyimpanan utama (cloud storage) untuk file Anda. 
- imgix mengambil gambar dari sumber eksternal (dalam kasus ini, Cloudflare R2) yang disebut sebagai **Source**.
- Karena imgix tidak menyimpan file asli secara langsung, opsi untuk menghapus file secara fisik dari penyimpanan hanya ada di sisi cloud storage Anda (Cloudflare R2).

---

## 2. Kondisi Saat Ini (Bucket Cloudflare R2 Sudah Dihapus)

Ketika Anda telah menghapus bucket Cloudflare R2 yang terhubung ke imgix:
1. **File Asli Terhapus**: File fisik Anda di R2 sudah tidak ada lagi.
2. **Metadata Index Tetap Muncul**: Asset Manager imgix mungkin masih menampilkan daftar index file tersebut karena data index lama belum diperbarui.
3. **Edge Cache Tetap Berjalan**: File gambar Anda kemungkinan masih bisa diakses/di-render melalui URL imgix. Hal ini terjadi karena CDN imgix menyimpan salinan cache di server edge mereka sampai masa aktif cache (TTL) berakhir.

---

## 3. Langkah-Langkah Penanganan

Untuk menghapus aset-aset tersebut dari imgix, silakan ikuti salah satu opsi berikut:

### Opsi A: Menghapus atau Menonaktifkan Seluruh Source di imgix (Direkomendasikan)
Jika Anda sudah tidak menggunakan bucket Cloudflare R2 tersebut dan ingin menghentikan seluruh layanan dari Source tersebut:
1. Masuk ke dashboard **imgix**.
2. Pilih **Source** yang terhubung ke Cloudflare R2 Anda yang sudah dihapus.
3. Klik tombol **Source Settings** (ikon roda gigi di bagian kanan atas halaman Source).
4. Gulir ke bawah hingga menemukan opsi status Source:
   - Pilih **Disable** jika Anda ingin menonaktifkannya sementara (aset akan mengembalikan status HTTP 410 Gone).
   - Pilih **Delete** jika Anda ingin menghapus Source tersebut secara permanen dari imgix.
5. Setelah Source dihapus atau dinonaktifkan, semua aset yang berkaitan akan otomatis hilang dari Asset Manager dan tidak dapat diakses lagi oleh publik.

### Opsi B: Menghapus Cache File Tertentu (Purge Cache)
Jika Anda hanya ingin menghapus cache beberapa file tertentu agar tidak bisa diakses lagi, tanpa menghapus seluruh Source:
1. Masuk ke dashboard **imgix**.
2. Buka menu **Tools** lalu pilih **Purge**.
3. Masukkan URL lengkap atau path dari aset yang ingin dihapus (contoh: `https://nama-source.imgix.net/gambar-anda.jpg`).
4. Klik **Purge**.
5. Karena file asli di Cloudflare R2 sudah dihapus, setelah proses Purge selesai, siapa pun yang mencoba mengakses URL tersebut akan menerima error 404 (Not Found).

