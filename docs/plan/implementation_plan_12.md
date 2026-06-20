# Goal Description

Rencana 12 bertujuan untuk mengimplementasikan sistem autentikasi dan penyimpanan kredensial tingkat global. Sebelumnya, kita mengharuskan pengguna menggunakan *Environment Variables* atau CLI Flags. Hal ini kurang nyaman bagi pengguna yang ingin menginstal CLI ini secara global (`npm install -g`). 

Dengan menambahkan perintah `auth` beserta *interactive wizard* (panduan interaktif) untuk proses *setup*, pengguna cukup menjalankan konfigurasi satu kali dan CLI akan mengingat kredensial mereka selamanya di sistem operasi mereka.

## Proposed Changes

### 1. Menambah Modul Dependensi Baru
Kita akan memasang paket UI interaktif.
- **Install**: `@inquirer/prompts` untuk form interaktif.

### 2. Membuat Sistem Manajemen Kredensial Global
Kita akan membuat direktori baru untuk perintah `auth` beserta manajemen file penyimpanannya.

#### [NEW] [src/auth.ts](../../src/auth.ts)
- Fungsi `getGlobalAuth()`: Membaca file `~/.imgix-purge-auth.json`.
- Fungsi `setGlobalAuth()`: Menyimpan/menimpa file `~/.imgix-purge-auth.json`.
- Fungsi `clearGlobalAuth()`: Menghapus file kredensial ("logout").

#### [NEW] [src/cmd/auth.ts](../../src/cmd/auth.ts)
- Perintah `auth setup`: Menjalankan Wizard interaktif yang menanyakan "API Key" dan "Source ID", kemudian menyimpannya.
- Perintah `auth status`: Melaporkan status kredensial saat ini (apakah sudah disetel, dari mana asalnya, dan menampilkan sebagian ujung API Key untuk konfirmasi).
- Perintah `auth clear`: Meminta konfirmasi lalu menghapus kredensial yang tersimpan.

### 3. Memperbarui Konfigurasi Utama
Integrasikan sistem Auth file ke dalam pembacaan awal saat program berjalan.

#### [MODIFY] [src/config.ts](../../src/config.ts)
- Tambahkan logika pembacaan cadangan (*fallback*). Jika `IMGIX_API_KEY` kosong di ENV, baca dari `getGlobalAuth()`.

### 4. Meregistrasikan Perintah 'auth' ke Commander
Modifikasi *entry point* aplikasi agar mengenali kumpulan perintah `auth`.

#### [MODIFY] [src/index.ts](../../src/index.ts)
- Daftarkan `auth` sebagai sebuah *Command Group*.
- Masukkan `setup`, `status`, dan `clear` sebagai sub-perintah (*sub-command*) di bawah `auth`.

## Verification Plan

### Automated Tests
- Menjalankan perintah `pnpm run build` dan memeriksa kembali `test:e2e` dengan kondisi *environment* kosong.

### Manual Verification
- Anda akan diminta menjalankan `imgix-purge auth setup` dan mengisi *wizard* interaktif.
- Anda akan diminta menjalankan `imgix-purge auth status` untuk memverifikasi.
- Terakhir, Anda akan menjalankan `imgix-purge purge` dan memastikan *purge* berjalan lancar meskipun Anda tidak menset bendera `--api-key` maupun *.env.local*!
