# Rencana Implementasi 18: CLI Interaktif Penuh Tanpa Konfigurasi Variabel Lingkungan (Zero-Env & API-Driven)

Rencana ini merinci penghapusan lengkap seluruh variabel lingkungan (env) dan bendera opsi targeting dari CLI `imgix`, menjadikan `~/.imgix-auth.json` sebagai satu-satunya sumber kredensial, serta menghadirkan pengalaman interaktif penuh berbasis resolusi API dinamis.

## Peninjauan Pengguna Diperlukan

> [IMPORTANT]
> - **Penghapusan Variabel Lingkungan (Zero-Env)**: CLI `imgix` tidak akan lagi memeriksa atau membaca variabel lingkungan apa pun (`IMGIX_API_KEY`, `IMGIX_SOURCE_ID`, `IMGIX_SECURE_TOKEN`, `IMGIX_DOMAINS`).
> - **Penghapusan Bendera Opsi Targeting**: Bendera manual seperti `--api-key`, `--source-id`, `--secure-token`, dan `--domain` akan dihapus dari CLI. CLI hanya menyisakan parameter aksi asli (misalnya jalur berkas pada `inspect`) dan bendera sistem (`--dry-run`, `--batch-size`).
> - **Pemicu Setup Autentikasi Otomatis**: Jika ada perintah yang memerlukan kredensial dijalankan tetapi berkas `~/.imgix-auth.json` kosong, CLI akan secara otomatis meluncurkan wizard pengaturan interaktif untuk meminta Kunci API, menyimpannya, lalu langsung melanjutkan eksekusi perintah tersebut.
> - **Resolusi Target Interaktif Penuh**: Seluruh penargetan Source, nama domain, dan token penandatanganan aman diselesaikan secara dinamis dari API Manajemen dengan menampilkan prompt checklist dropdown (`multiselect` dengan select-all/clear-all).

---

## Rencana Perubahan

### Konfigurasi & Auth Global

#### [MODIFY] [auth.ts](../../../src/pkg/auth.ts)
- Sederhanakan antarmuka `AuthConfig` untuk hanya menyimpan `apiKey`.
- Hapus semua fallback ke variabel lingkungan.

#### [MODIFY] [config.ts](../../../src/pkg/config.ts)
- Bersihkan pemrosesan `process.env.IMGIX_API_KEY`, `IMGIX_SOURCE_ID`, `IMGIX_SECURE_TOKEN`, dan `IMGIX_DOMAINS` secara total.
- Hapus bendera opsi targeting manual (`--api-key`, `--source-id`, `--secure-token`, `--domain`).
- Perbarui `validateConfig`: jika `apiKey` tidak disetel, panggil `runAuthSetup` secara dinamis untuk meminta Kunci API dari pengguna, simpan, lalu muat ulang konfigurasi.

---

### Command Handlers & Entrypoint

#### [MODIFY] [imgix.ts](../../../src/bin/imgix.ts)
- Bersihkan konfigurasi program `Command`: hapus seluruh opsi `--api-key`, `--source-id`, `--secure-token`, dan `--domain`.
- Bersihkan panduan variabel lingkungan dari teks bantuan CLI.

#### [MODIFY] [auth.ts](../../../src/cmd/auth.ts)
- Perbarui `runAuthSetup` agar hanya meminta Kunci API Manajemen.
- Perbarui `runAuthStatus` agar hanya menampilkan status login Kunci API.

#### [MODIFY] [purge.ts](../../../src/cmd/purge.ts), [assets.ts](../../../src/cmd/assets.ts), [source.ts](../../../src/cmd/source.ts), [url.ts](../../../src/cmd/url.ts)
- Perbarui semua logika perintah agar menggunakan fungsi pembantu bersama untuk menyelesaikan Source ID, domain, dan `secure_url_token` secara dinamis lewat menu checklist interaktif.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Perbarui rangkaian pengujian E2E untuk memvalidasi alur tanpa variabel lingkungan.
- Pastikan pengujian memverifikasi pemicu wizard setup otomatis jika Kunci API kosong.
- Jalankan tipe pemeriksaan dan kompilasi build:
  - `pnpm run types:check`
  - `pnpm run build`
- Jalankan tes runner:
  - `pnpm run test:e2e`

### Verifikasi Manual
- Hapus berkas `.env` atau `.env.local` di proyek, dan hapus variabel lingkungan di shell.
- Jalankan perintah `imgix purge` pada sesi bersih dan pastikan CLI menanyakan Kunci API, menyimpannya, lalu menampilkan checklist Source secara interaktif.
