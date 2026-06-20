# Goal Description

Rencana 11 bertujuan untuk memperbaiki dan melengkapi tampilan informasi `imgix-purge --help`. Saat ini, opsi-opsi penting (seperti `--api-key`) tersembunyi karena dimasukkan sebagai opsi spesifik milik sub-perintah `purge`, dan informasi mengenai *Environment Variables* hilang karena sistem bawaan Commander menimpa fungsi *help* manual kita yang lama.

Rencana ini akan merekonstruksi menu *help* agar rapi, profesional, dan informatif secara global.

## User Review Required

> [!NOTE]
> Setelah rencana ini diaplikasikan, layar `imgix-purge --help` Anda akan otomatis menyertakan:
> 1. Daftar **Global Options** (termasuk `--api-key` dan `--source-id`).
> 2. Penjelasan rinci tentang **Environment Variables** di bagian bawah.
> 
> Fungsi manual `showHelp` dari kode lama akan saya hapus seluruhnya karena *Commander* sudah punya *auto-generator* yang jauh lebih canggih. Apakah Anda setuju?

## Proposed Changes

### 1. Memindahkan Opsi Global ke Root Command
Opsi yang berlaku secara global akan diangkat ke atas (bukan lagi tersembunyi di dalam perintah `purge`), sehingga akan langsung terlihat ketika pengguna mengetik `imgix-purge --help`.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Memindahkan `.option('--api-key <key>', ...)` dan `.option('--source-id <id>', ...)` ke konfigurasi objek `program` (sebelum `.command('purge')`).
- Menambahkan blok `.addHelpText('after', ...)` ke objek `program` untuk menyisipkan panduan *Environment Variables* (penjelasan tentang `IMGIX_API_KEY` dan `IMGIX_SOURCE_ID`) di bagian bawah *help menu*.
- Mengambil nilai `program.opts()` di dalam aksi `purge` untuk menyesuaikan nilai di objek `config`.

### 2. Menghapus Logika Help Manual (Redundan)
Karena Commander akan mengambil alih urusan cetak *help menu* secara total, kode *parser* manual lama di `config.ts` tidak lagi diperlukan.

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Menghapus eksport fungsi `showHelp()`.
- Menghapus pengecekan boolean `help` dari interface dan parser argumen (karena bendera `-h`/`--help` akan diintersep langsung oleh Commander sebelum mencapai logika kita).

## Verification Plan

### Automated Tests
- Menjalankan kembali seluruh tes E2E untuk memastikan tes `--help` menangkap format menu yang baru dengan benar.

### Manual Verification
- Anda akan dipersilakan menjalankan perintah `imgix-purge --help` di terminal Anda.
- Tampilan harus memperlihatkan opsi `--api-key` di bagian **Options**, serta mencantumkan bagian kustom **Environment Variables** secara jelas di akhir teks tanpa perlu mengetikkan sub-perintah apa pun.
