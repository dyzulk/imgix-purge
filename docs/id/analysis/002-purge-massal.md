# Solusi Purge Masal (Bulk Purge) di imgix

Dokumen ini menjelaskan solusi dan metode alternatif untuk menghapus/membersihkan cache seluruh aset di imgix secara masal tanpa perlu melakukannya satu per satu untuk setiap URL.

---

## Mengapa Tidak Ada Tombol Purge Seluruh Source?
Secara default, imgix tidak menyediakan tombol sekali klik di dashboard untuk membersihkan seluruh cache Source. Hal ini dikarenakan operasi tersebut sangat memakan sumber daya dan dapat menurunkan performa CDN secara drastis saat imgix harus mengambil ulang semua gambar baru dari origin storage Anda.

Namun, terdapat tiga solusi yang dapat Anda gunakan sebagai alternatif:

---

## Solusi 1: Menghubungi Dukungan imgix (Support)
Jika Anda memiliki kebutuhan mendesak untuk membersihkan seluruh cache dari suatu Source:
1. Kirimkan email ke **support@imgix.com** menggunakan email terdaftar akun Anda.
2. Cantumkan **Source ID** Anda (dapat dilihat di dashboard imgix pada pengaturan Source).
3. Berikan alasan mengapa Anda membutuhkan pembersihan total cache (misal: storage asal R2 sudah dihapus secara permanen).
4. Tim dukungan imgix akan melakukan pembersihan total cache (full cache flush) untuk Source Anda secara manual di sisi server mereka.

---

## Solusi 2: Menghapus dan Membuat Ulang Source di Dashboard
Metode ini adalah cara tercepat dan paling efisien jika Anda memang ingin mengganti media penyimpanan atau tidak menggunakan bucket lama lagi:
1. Masuk ke dashboard **imgix** dan pilih Source Anda.
2. Klik tombol **Source Settings** di kanan atas.
3. Gulir ke bagian bawah halaman lalu klik **Delete** untuk menghapus Source.
4. Buatlah Source baru (meskipun Anda mengarahkannya ke penyimpanan baru yang kosong atau penyimpanan pengganti).
5. Dengan menghapus Source lama, seluruh cache dari URL lama di bawah Source tersebut akan otomatis dibuang secara permanen.

---

## Solusi 3: Otomatisasi Menggunakan Skrip API (Batch Purge)
Anda dapat menggunakan proyek Node.js `imgix-purge` ini untuk membuat skrip otomatisasi yang mengambil seluruh daftar aset lalu melakukan permintaan purge untuk setiap aset tersebut secara berurutan.

Langkah-langkah implementasinya:
1. **Dapatkan API Key**: Masuk ke dashboard imgix, pergi ke menu API Keys, lalu buat API Key baru dengan izin:
   - `Asset Manager Browse` (untuk mendapatkan daftar file).
   - `Purge` (untuk membersihkan cache).
2. **Ambil Daftar Aset (Browse Assets)**:
   - Gunakan Management API untuk mengambil daftar aset:
     ```http
     GET https://api.imgix.com/api/v1/sources/<YOUR_SOURCE_ID>/assets
     Headers:
       Authorization: Bearer <YOUR_API_KEY>
       Accept: application/vnd.api+json
     ```
3. **Kirim Permintaan Purge**:
   - Untuk setiap aset yang ditemukan dari langkah kedua, kirim permintaan purge secara bertahap (batch):
     ```http
     POST https://api.imgix.com/api/v1/purge
     Headers:
       Authorization: Bearer <YOUR_API_KEY>
       Content-Type: application/vnd.api+json
     Body:
       {
         "data": {
           "attributes": {
             "url": "https://nama-source.imgix.net/path/ke/gambar.jpg"
           },
           "type": "purges"
         }
       }
     ```
