# Rencana Implementasi 04: Konfigurasi Git dan Komit Terencana

Rencana ini menjelaskan langkah-langkah untuk mengonfigurasi `.gitignore` (sangat penting untuk melindungi kredensial sensitif seperti `.env.local` dan mencegah komit `node_modules`), merencanakan berkas proyek (stage), dan membuat komit awal.

## Audit Keamanan & Verifikasi

> [!CAUTION]
> - **Peringatan Kebocoran Kredensial**: Saat ini, `.gitignore` sepenuhnya kosong. Jika kita melanjutkan tanpa konfigurasi, `.env.local` pribadi Anda yang berisi `IMGIX_API_KEY` akan dikomit dan diekspos ke riwayat Git.
> - **Tindakan yang Diperlukan**: Kita harus menulis templat `.gitignore` standar terlebih dahulu sebelum menjalankan tindakan Git add/commit apa pun.

---

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Konfigurasi Git**: Komit akan menggunakan penulis Git terkonfigurasi lokal Anda. Jika Git tidak dikonfigurasi secara global, perintah komit mungkin meminta email/nama pengguna Anda.
> - **Pesan Komit**: Kami mengusulkan pesan komit `feat: implement modular rate-limited imgix bulk purge tool`.

---

## Rencana Perubahan

### Konfigurasi Git

#### [MODIFY] [.gitignore](../../../.gitignore)
- Tambahkan entri untuk:
  - `node_modules/`
  - `.env`
  - `.env.local`
  - `.env.*.local`
  - `dist/`

---

## Rencana Verifikasi

### Pengujian Otomatis
- Menjalankan `git status` setelah memodifikasi `.gitignore` untuk memverifikasi bahwa `.env.local` dan `node_modules` berhasil diabaikan dan tidak dilacak.
- Menambahkan berkas ke stage: `git add .`
- Membuat komit: `git commit -m "feat: implement modular rate-limited imgix bulk purge tool"`
