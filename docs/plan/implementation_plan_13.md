# Goal Description

Rencana 13 bertujuan untuk memoles tampilan visual terminal (CLI UI) agar persis seperti perkakas modern tingkat tinggi (*Vercel*, *Wrangler*, *create-cloudflare*). Pengguna menginginkan antarmuka yang bersih, indah, tanpa *emoji* sistem, dan tanpa teks kaku bergaya jadul.

Kita akan menggunakan dependensi `@clack/prompts` dan `picocolors` yang merupakan standar emas (*gold standard*) di industri pengembangan CLI modern saat ini (digunakan oleh SvelteKit, Cloudflare, dll).

## Proposed Changes

### 1. Perubahan Dependensi
Kita akan mencabut dependensi Inquirer dan memasang Clack.
- **Uninstall**: `@inquirer/prompts`
- **Install**: `@clack/prompts` dan `picocolors`

### 2. Merombak Visual Autentikasi (Setup)
Kita akan menulis ulang fungsi *wizard* dengan API `@clack/prompts`.

#### [MODIFY] [src/cmd/auth.ts](../../src/cmd/auth.ts)
- Menggunakan `intro('imgix-purge Authentication Setup')` dan `outro()` untuk pembuka/penutup.
- Mengganti pemanggilan `input()` dari Inquirer menjadi `text()` milik Clack.
- Menambahkan validasi pembatalan dengan `isCancel`.
- Menggunakan `picocolors` (misal: `pc.green('✔')`) untuk merender *icons* status di fungsi `runAuthStatus` dan `runAuthClear`.

## Verification Plan

### Manual Verification
- Anda akan menjalankan ulang `imgix-purge auth setup` dan `imgix-purge auth status`.
- Tampilan akan langsung berubah secara radikal, jauh lebih elegan dan minimalis seperti Vercel CLI atau Wrangler!
