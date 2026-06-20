# Rencana Implementasi 15: Penamaan Ulang Paket ke imgix-cli-unofficial dan Perintah CLI ke imgix

Rencana ini bertujuan untuk mempublikasikan paket ini ke repositori npm dengan nama `imgix-cli-unofficial` dan mengganti panggilan perintah terminal menjadi `imgix` (dari sebelumnya `imgix-purge`). Selain itu, semua tautan repositori GitHub akan disesuaikan ke `imgix-cli-unofficial`.

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Perubahan Nama Pemanggilan CLI**: Nama perintah terminal yang sebelumnya `imgix-purge` akan berubah menjadi `imgix` secara penuh.
> - **Nama Berkas Eksekutabel**: Berkas pembungkus di `bin/imgix-purge.js` akan berganti nama menjadi `bin/imgix.js`.
> - **Penyimpanan Kredensial Global**: Nama berkas penyimpanan kredensial global di sistem operasi pengguna akan disesuaikan dari `~/.imgix-purge-auth.json` menjadi `~/.imgix-auth.json`.

---

## Rencana Perubahan

### Konfigurasi dan Setelan Pembangun

#### [MODIFY] [package.json](../../../package.json)
- Ubah properti `"name"` dari `"imgix-purge"` menjadi `"imgix-cli-unofficial"`.
- Perbarui objek `"bin"` untuk memetakan perintah `"imgix"` ke berkas `"./bin/imgix.js"`.
- Ubah script `"imgix-purge"` menjadi `"imgix"` dan sesuaikan isi eksekusinya ke `node bin/imgix.js`.
- Perbarui script `"unlink:local"` dari `imgix-purge` ke `imgix`.
- Perbarui URL repositori, bug tracker, dan homepage agar menunjuk ke `https://github.com/dyzulk/imgix-cli-unofficial`.
- Sesuaikan dependensi lokal self-reference `"imgix-purge": "link:"` menjadi `"imgix-cli-unofficial": "link:"`.

#### [DELETE] [bin/imgix-purge.js](../../../bin/imgix-purge.js)
- Hapus berkas eksekutabel pembungkus lama.

#### [NEW] [bin/imgix.js](../../../bin/imgix.js)
- Buat berkas eksekutabel pembungkus baru dengan nama `bin/imgix.js` dengan konten shebang node mengarah ke `./dist/index.js`.

---

### Perubahan Kode Sumber Inti

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Ubah pemanggilan `program.name('imgix-purge')` menjadi `program.name('imgix')`.
- Perbarui deskripsi aplikasi CLI agar merefleksikan eskalasi kegunaan umum imgix.
- Ubah teks bantuan penanganan output Commander dari `Usage: imgix-purge` ke `Usage: imgix`.

#### [MODIFY] [src/auth.ts](../../../src/auth.ts)
- Ubah nama berkas penyimpanan kredensial global `AUTH_FILE_PATH` menjadi `.imgix-auth.json`.

---

### Perubahan Paket Pengujian

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- Perbarui seluruh instans eksekusi tes E2E dari `node ./bin/imgix-purge.js` ke `node ./bin/imgix.js`.
- Sesuaikan asersi teks bantuan agar mencocokkan `Usage: imgix` alih-alih `Usage: imgix-purge`.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Jalankan tipe pemeriksaan TypeScript: `pnpm run types:check`
- Jalankan proses build proyek: `pnpm run build`
- Jalankan tes E2E untuk memvalidasi perubahan pemanggilan perintah: `pnpm run test:e2e`

### Verifikasi Manual
- Jalankan instalasi lokal menggunakan `pnpm link --global` untuk memverifikasi pendaftaran alias `imgix`.
- Jalankan perintah `imgix --help` untuk mengonfirmasi output bantuan dengan nama CLI yang baru.
- Jalankan `imgix auth status` untuk memverifikasi proses fallback kredensial.
