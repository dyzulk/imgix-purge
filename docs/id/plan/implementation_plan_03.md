# Rencana Implementasi 03: Penyesuaian Perilaku CLI dan Implementasi Menu Bantuan

Rencana ini menyesuaikan perilaku eksekusi default dari alat CLI dan menambahkan menu bantuan yang komprehensif untuk meningkatkan pengalaman pengguna.

## Hasil Audit Perilaku CLI dan Rekomendasi

Berdasarkan masukan Anda, kami menganalisis desain CLI:
1. **Default ke Eksekusi**: Merupakan hal yang umum bagi alat baris perintah untuk mengeksekusi perintah utama mereka secara default saat dijalankan. Untuk mencegah penghapusan massal yang tidak disengaja di produksi, kami akan mencetak log konfirmasi mulai yang mencolok, tetapi segera melanjutkan eksekusi.
2. **Bendera Dry-Run**: Kami akan memperkenalkan bendera `--dry-run` (atau `-d`) untuk memungkinkan Anda mensimulasikan operasi dan melihat daftar aset tanpa melakukan permintaan HTTP POST purge yang sebenarnya.
3. **Menu Bantuan**: Kami akan menangkap bendera `--help` (atau `-h`) untuk menampilkan panduan CLI yang ramah pengguna dan segera keluar tanpa memicu kesalahan validasi atau permintaan.

---

## Peninjauan Pengguna Diperlukan

> [!WARNING]
> - **Bahaya Eksekusi**: Menjalankan `pnpm purge` tanpa bendera apa pun sekarang akan melakukan permintaan pembersihan yang sebenarnya. Karena bucket asal Cloudflare R2 Anda sudah dihapus, ini akan membuat gambar yang dibersihkan secara permanen mengembalikan error 404. Silakan jalankan dengan `--dry-run` atau `-d` terlebih dahulu untuk memverifikasi daftar gambar.

---

## Rencana Perubahan

### CLI & Konfigurasi

#### [MODIFY] [config.ts](../../../src/config.ts)
- Ubah penganalisis argumen untuk:
  - Memeriksa bendera `-h` atau `--help`.
  - Memeriksa bendera `-d` atau `--dry-run`.
  - Mengatur `dryRun = true` hanya jika bendera tersebut ada; jika tidak `dryRun = false` (default ke mode eksekusi).
- Implementasikan fungsi `showHelp()` yang mencetak panduan penggunaan, opsi yang tersedia, dan variabel lingkungan yang diperlukan, lalu keluar.

---

### Alur Eksekusi Inti

#### [MODIFY] [purge.ts](../../../src/purge.ts)
- Panggil `showHelp()` segera jika bendera bantuan terdeteksi, sebelum melakukan validasi lingkungan.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Menjalankan `pnpm purge --help` untuk mengonfirmasi bahwa menu bantuan ditampilkan dengan benar dan skrip keluar dengan kode status 0.
- Menjalankan `pnpm purge --dry-run` untuk mengonfirmasi bahwa mode simulasi beroperasi dengan benar.

### Verifikasi Manual
- Meninjau pesan peringatan log yang diperbarui pada awal eksekusi.
