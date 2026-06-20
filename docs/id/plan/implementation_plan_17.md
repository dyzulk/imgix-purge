# Rencana Implementasi 17: Pembersihan Selektif, Pembersihan Berkas, dan Piping Stdin

Rencana ini merinci implementasi kemampuan pembersihan cache selektif (selective purge), input pembersihan berbasis berkas (file-based), dan dukungan piping standard input (stdin) di dalam perintah `imgix purge`.

## Peninjauan Pengguna Diperlukan

> [IMPORTANT]
> - **Peningkatan Perintah Purge**: Perintah `imgix purge` akan diperbarui dari utilitas "bulk-purge all" yang ketat menjadi mendukung argumen target `[paths...]` dan bendera opsi (`--file`, `--stdin`).
> - **Deteksi Otomatis stdin**: Jika data disalurkan (piped) ke CLI (misalnya, `cat list.txt | imgix purge`), perintah akan secara otomatis membaca dari standard input jika tidak ada argumen lain yang disediakan, membuat integrasi ke dalam pipeline build menjadi lancar.
> - **Normalisasi Input**: Jalur input yang dimulai dengan `http://` atau `https://` akan diproses secara langsung, sedangkan jalur relatif (misalnya `/img.jpg` atau `img.jpg`) akan secara otomatis ditambahkan domain target yang diselesaikan.

---

## Rencana Perubahan

### CLI Entrypoint

#### [MODIFY] [imgix.ts](../../../src/bin/imgix.ts)
- Perbarui definisi perintah `purge` untuk mendukung argumen opsional `[paths...]`.
- Tambahkan opsi:
  - `-f, --file <file>`: Membaca daftar jalur dari berkas.
  - `-s, --stdin`: Membaca daftar jalur dari standard input (stdin).
- Perbarui panggilan aksi untuk meneruskan argumen dan opsi ke `runPurge(paths, options)`.

---

### Command Handlers

#### [MODIFY] [purge.ts](../../../src/cmd/purge.ts)
- Perbarui definisi `runPurge`: `export async function runPurge(paths?: string[], options?: { file?: string; stdin?: boolean })`.
- Tambahkan pembantu pembaca standard input untuk mengumpulkan data piped.
- Tambahkan pembantu pembaca berkas menggunakan `fs.readFileSync` atau `fs.promises.readFile`.
- Implementasikan logika resolusi jalur:
  - Jika jalur disediakan melalui argumen CLI, berkas, atau stdin, lakukan pembersihan selektif.
  - Jika tidak ada jalur yang disediakan, kembali ke perilaku asli (mengambil seluruh aset dari Source dan melakukan pembersihan massal).
  - Normalisasikan jalur (pastikan garis miring di awal untuk jalur relatif) dan buat URL target (jalur relatif yang dikombinasikan dengan domain target).
- Eksekusi antrean pembatasan laju (3 permintaan per detik) untuk URL target yang diselesaikan.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Buat `e2e/purge_selective.test.ts` untuk menguji:
  - `imgix purge /image1.jpg /image2.jpg` (argumen argumen selektif).
  - `imgix purge --file list.txt` (input pemecahan berkas).
  - `echo /image3.jpg | imgix purge --stdin` (pemeriksaan piping stdin).
- Jalankan tipe pemeriksaan dan kompilasi build:
  - `pnpm run types:check`
  - `pnpm run build`
- Jalankan tes runner:
  - `pnpm run test:e2e`

### Verifikasi Manual
- Eksekusi `imgix purge` pada repositori pengujian untuk memverifikasi pembersihan selektif.
- Salurkan daftar jalur aset ke `imgix purge` dan pastikan mereka diuraikan dan dimasukkan ke antrean dengan benar.
