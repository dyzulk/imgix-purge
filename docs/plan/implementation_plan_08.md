# Goal Description

Rencana 08 bertujuan untuk membuat `imgix-purge` benar-benar bertingkah seperti perkakas CLI standar (global) dengan cara menghapus ketergantungan pada file `.env.local`. Saat CLI diinstal secara global oleh orang lain, memaksa mereka membuat file `.env.local` di direktori saat ini sangatlah tidak lazim dan bisa memunculkan *log* yang mengganggu (seperti `◇ injected env`).

## User Review Required

> [!NOTE]
> - Sebagai gantinya, CLI ini akan menerima *Environment Variables* standar (`IMGIX_API_KEY` dan `IMGIX_SOURCE_ID`) langsung dari *shell/system* pengguna. 
> - CLI ini juga akan ditambahkan dukungan parameter flag langsung seperti `--api-key <key>` dan `--source-id <id>`, yang mana ini adalah *best practice* untuk CLI. Apakah Anda setuju dengan penghapusan library `dotenv` sepenuhnya?

## Proposed Changes

### 1. Menghapus Ketergantungan `dotenv`
Menghapus pemuatan `.env.local` secara paksa agar CLI tidak menampilkan log injeksi *dotenv* yang membingungkan bagi pengguna akhir.

#### [MODIFY] [package.json](../../package.json)
- Menghapus dependensi `dotenv` dari bagian `dependencies`.

### 2. Memperbarui Entry Point (Commander)
Menambahkan flag baru ke dalam framework Commander agar pengguna dapat memasukkan kredensial langsung saat memanggil perintah.

#### [MODIFY] [src/index.ts](../../src/index.ts)
Menambahkan definisi flag:
- `.option('--api-key <key>', 'Your imgix Management API Key (overrides IMGIX_API_KEY env)')`
- `.option('--source-id <id>', 'Your imgix Source ID (overrides IMGIX_SOURCE_ID env)')`
- Mengirimkan argumen yang diparsing oleh Commander untuk mengganti nilai `config` sebelum mengeksekusi `runPurge()`.

### 3. Memperbarui Manajemen Konfigurasi & Pesan Error
Mengubah `config.ts` untuk tidak lagi memanggil `dotenv` dan memperbarui panduan/pesan error agar lebih masuk akal bagi pengguna publik.

#### [MODIFY] [src/config.ts](../../src/config.ts)
- Menghapus baris impor `dotenv`.
- Mengubah fungsi `validateConfig()` sehingga pesan errornya berbunyi: `Error: Missing API Key or Source ID. Please provide them via --api-key and --source-id flags, or by setting the IMGIX_API_KEY and IMGIX_SOURCE_ID environment variables.`
- Mengubah output fungsi `showHelp()` agar tidak menyebut-nyebut file `.env.local`.

#### [MODIFY] [e2e/purge.test.ts](../../e2e/purge.test.ts)
- Menyesuaikan pengujian (khususnya pengecekan error) agar cocok dengan pesan error yang baru.

## Verification Plan

### Automated Tests
- Menjalankan perintah pengujian `pnpm run test:e2e` untuk memastikan respons versi baru tidak rusak.
- Pengujian harus gagal dengan elegan (`Error: Missing API Key...`) jika flag/env tidak diberikan, bukan karena `.env.local` hilang.

### Manual Verification
- Menjalankan kompilasi dengan `pnpm run build`.
- Menjalankan `pnpm imgix-purge` tanpa file `.env.local` untuk memastikan CLI menolak eksekusi dengan pesan bantuan yang jelas, alih-alih melempar error *crash* atau menampilkan teks `injected env`.
