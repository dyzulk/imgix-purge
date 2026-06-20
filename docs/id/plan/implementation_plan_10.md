# Goal Description

Rencana 10 bertujuan untuk meningkatkan keamanan CLI dan menyelaraskannya dengan *best practices* industri perkakas (seperti `git`, `npm`, atau `docker`). 

Saat ini, mengeksekusi `imgix-purge` tanpa argumen akan langsung memicu proses `purge` (sebagai *default command*). Meskipun saat ini akan gagal jika kredensial tidak diset, jika pengguna sudah menset variabel env `IMGIX_API_KEY` secara global, maka *cache* mereka bisa tak sengaja terhapus hanya karena mereka mengetikkan nama aplikasinya.

Rencana ini akan mencegah hal tersebut.

## Proposed Changes

### 1. Mencabut Sifat 'Default' dari Perintah Purge
Kita akan mengubah pengaturan registrasi *command* di Commander agar `purge` tidak lagi menjadi aksi bawaan.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- **Hapus**: Objek `{ isDefault: true }` dari `.command('purge', { isDefault: true })`.
- **Tambah**: Logika deteksi argumen tambahan. Jika `process.argv` tidak memiliki argumen lanjutan selain nama program, secara otomatis paksa Commander untuk mencetak layar bantuan (`program.outputHelp()`).

### 2. Memperbarui Pengujian E2E (End-to-End)
Karena pemanggilan perintah berubah, tes E2E juga harus disesuaikan agar tidak *error*.

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- Mengubah fungsi tes yang semula memanggil `node ./bin/imgix-purge.js` (tanpa perintah tambahan) agar secara spesifik memanggil `node ./bin/imgix-purge.js purge` atau menangkap layar bantuan saat dipanggil tanpa argumen.

## Verification Plan

### Automated Tests
- Menjalankan perintah `pnpm run build` dan `pnpm run test:e2e` untuk memastikan CLI yang baru di-*compile* dapat berjalan mulus.

### Manual Verification
- Anda akan diminta mengetikkan perintah `imgix-purge` di terminal Anda.
- Hasil yang diharapkan: **Tidak akan ada error *Missing API Key***, melainkan terminal akan memunculkan teks panduan penggunaan standar (*Help Menu*).
