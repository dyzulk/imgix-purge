# Goal Description

Rencana ini bertujuan untuk menghilangkan penulisan path absolut (atau penggunaan fungsi yang meresolusi path secara absolut) yang hanya valid secara lokal di perangkat Anda. Hal ini mencakup:
1. Mengubah cara resolusi path di pengujian `e2e` agar lebih universal atau menggunakan eksekusi relatif langsung.
2. Memperbaiki tautan *hyperlink* dalam berkas-berkas dokumentasi Markdown (khususnya di `docs/plan/`) yang secara tidak sengaja ter-commit dengan URL lokal IDE (`file:///c:/Users/...`) menjadi tautan relatif standar GitHub agar dapat diklik di repositori web.

## Proposed Changes

### 1. Refactor E2E Tests (Path Resolution)
Mengubah penulisan `path.resolve(process.cwd(), ...)` menjadi path eksekusi relatif sederhana di command line.

#### [MODIFY] [e2e/purge.test.ts](../../e2e/purge.test.ts)
- **Hapus**: `const CLI_PATH = path.resolve(process.cwd(), 'bin', 'imgix-purge.js');`
- **Ganti**: Langsung memanggil `node ./bin/imgix-purge.js` di dalam fungsi `execAsync()`.

### 2. Memperbaiki Tautan Dokumentasi Markdown
Semua `implementation_plan_*.md` yang terlanjur menggunakan format URL lokal IDE akan direplace menjadi format *relative link* GitHub.

#### [MODIFY] docs/plan/implementation_plan_*.md
- Mengubah format `[package.json](../../package.json)` menjadi `[package.json](../../package.json)`.
- Perubahan yang sama berlaku untuk semua referensi file (`src/config.ts`, `bin/imgix-purge.js`, `tsup.config.ts`, dll) di semua dokumen dalam folder `docs/plan`.

## Verification Plan

### Automated Tests
- Menjalankan ulang `pnpm run test:e2e` untuk memastikan tes masih berjalan lancar dengan pemanggilan path relatif.
- Menjalankan pencarian string `file:///c:/` di seluruh proyek untuk memastikan angka kemunculannya adalah `0`.

### Manual Verification
- Melakukan verifikasi `git diff` untuk memastikan hanya tautan markdown dan `e2e/purge.test.ts` yang berubah.
- Melakukan `git push` kembali ke repositori.
