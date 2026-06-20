# Rencana Implementasi 16: Rencana Eskalasi Fitur CLI imgix (Unofficial)

Rencana ini bertujuan untuk merealisasikan ide-ide eskalasi dari `ide_eskalasi_cli.md` dengan menambahkan sub-perintah `source`, `assets`, `url`, `diagnose`, dan `usage` di bawah CLI `imgix` yang baru, serta merestrukturisasi berkas ke dalam pola folder modular terpadu (`src/bin`, `src/pkg`, `src/internal`).

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Restrukturisasi Berkas Sumber**: Kita akan memindahkan berkas-berkas di dalam `src/` ke subfolder baru (`bin`, `pkg`, `internal`) untuk meningkatkan kerapian kode.
> - **Penyelarasan Kredensial Global (`auth setup`)**: Wizard interaktif `imgix auth setup` akan dimodifikasi untuk meminta API Key, Source ID, dan Secure URL Token secara bersamaan dan menyimpannya di `~/.imgix-auth.json`.
> - **Izin Kunci API (API Key Scopes)**: Untuk menjalankan seluruh fungsionalitas CLI, direkomendasikan menggunakan satu Kunci API dengan hak akses penuh (*Admin/All Scopes*), atau minimal memiliki izin: `Purge`, `Asset Manager Browse`, `Sources` (Read), dan `Billing` (Read).
> - **Penanganan Error 403 Perintah `usage`**: Jika API mengembalikan status 403 (Forbidden), CLI akan menampilkan informasi pencegahan secara bersahabat bahwa Kunci API kekurangan izin `Billing` atau langganan tidak mendukung metrik.

---

## Rencana Perubahan

### 1. Penataan Ulang Struktur Berkas (Restrukturisasi)

Kita akan memindahkan berkas sumber ke tata letak modular:

#### [NEW] [src/bin/imgix.ts](../../../src/bin/imgix.ts)
- Pindahkan dari `src/index.ts`. Ini adalah entry point utama CLI.

#### [NEW] [src/pkg/config.ts](../../../src/pkg/config.ts)
- Pindahkan dari `src/config.ts`. Tambahkan dukungan pembacaan `secureToken` (`IMGIX_SECURE_TOKEN`).

#### [NEW] [src/pkg/auth.ts](../../../src/pkg/auth.ts)
- Pindahkan dari `src/auth.ts`. Perbarui `AuthConfig` untuk menyertakan `secureToken` opsional.

#### [NEW] [src/pkg/api.ts](../../../src/pkg/api.ts)
- Pindahkan dari `src/api.ts`. Tambahkan integrasi API baru (`fetchSources`, `fetchSourceDetail`, `fetchBillingUsage`).

#### [NEW] [src/internal/utils/helper.ts](../../../src/internal/utils/helper.ts)
- Pindahkan dari `src/utils.ts`. Menyediakan utilitas delay dan normalisasi.

#### [NEW] [src/internal/ui/prompts.ts](../../../src/internal/ui/prompts.ts)
- Buat modul pembantu visual UI kustom untuk membungkus `@clack/prompts` agar visualisasi status dan elemen visual terminal konsisten.

#### [DELETE] Berkas Lama di Root `src/`
- Hapus berkas `src/index.ts`, `src/config.ts`, `src/auth.ts`, `src/api.ts`, dan `src/utils.ts` setelah dipindahkan.

---

### 2. Penyesuaian Konfigurasi & Build

#### [MODIFY] [package.json](../../../package.json)
- Perbarui skrip `"dev"` menjadi `"tsx src/bin/imgix.ts"`.

#### [MODIFY] [bin/imgix.js](../../../bin/imgix.js)
- Ubah path impor target dari `../dist/index.js` menjadi `../dist/bin/imgix.js`.

#### [MODIFY] [tsup.config.ts](../../../tsup.config.ts)
- Sesuaikan entrypoint kompilasi ke `src/bin/imgix.ts` dengan opsi mempertahankan struktur direktori atau menghasilkan bundle mandiri ke `dist/bin/imgix.js`.

---

### 3. Implementasi Perintah CLI Baru

#### [NEW] [src/cmd/source.ts](../../../src/cmd/source.ts)
- Implementasikan sub-perintah `source list` dan `source info <source-id>` menggunakan tata letak estetika Clack.

#### [NEW] [src/cmd/assets.ts](../../../src/cmd/assets.ts)
- Implementasikan sub-perintah `assets list` (menelusuri berkas dengan paginasi sederhana).
- Implementasikan `assets inspect <path>` dengan dua opsi terpisah:
  - **Secara default**: Melakukan request ke server render dengan parameter kueri `fm=json` untuk mengambil metadata berkas (EXIF, resolusi, warna) tanpa autentikasi.
  - **Opsi bendera `--api` / `-a`**: Melakukan kueri ke API Manajemen imgix untuk mengambil metadata administratif aset dari Asset Manager.

#### [NEW] [src/cmd/url.ts](../../../src/cmd/url.ts)
- Implementasikan sub-perintah `url sign <path> [params]` menggunakan algoritma MD5 lokal untuk menempelkan tanda tangan keamanan (`s=...`).
- Implementasikan sub-perintah `url optimize <url>` untuk menganalisis dan merekomendasikan penambahan kueri parameter optimasi otomatis.

#### [NEW] [src/cmd/diagnose.ts](../../../src/cmd/diagnose.ts)
- Implementasikan sub-perintah `diagnose <url>` dengan mengirimkan HTTP `HEAD`/`GET` request, mengurai header cache (`X-Cache`, `CF-Cache-Status`), status kompresi, dan metode rendering.

#### [NEW] [src/cmd/usage.ts](../../../src/cmd/usage.ts)
- Implementasikan sub-perintah `usage status` untuk menampilkan grafik penggunaan bandwidth dan rendering request, dilengkapi penanganan anggun status error 403.

---

### 4. Pengujian End-to-End (E2E)

#### [NEW] [e2e/auth.test.ts](../../../e2e/auth.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix auth` (setup, status, clear).

#### [NEW] [e2e/source.test.ts](../../../e2e/source.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix source` (list, info).

#### [NEW] [e2e/assets.test.ts](../../../e2e/assets.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix assets` (list, inspect).

#### [NEW] [e2e/url.test.ts](../../../e2e/url.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix url` (sign, optimize).

#### [NEW] [e2e/diagnose.test.ts](../../../e2e/diagnose.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix diagnose`.

#### [NEW] [e2e/usage.test.ts](../../../e2e/usage.test.ts)
- Membuat berkas skenario pengujian E2E untuk memvalidasi perintah `imgix usage`.

---

### Struktur Direktori Proyek Terpadu (Pola Modular)

Berikut adalah ilustrasi tata letak folder pengembangan (*development*) dan hasil kompilasi (*build*) untuk mendukung seluruh perintah di atas:

```
imgix-cli-unofficial/
├── bin/                       # Skrip eksekusi terkompilasi (npm link entrypoint)
│   └── imgix.js               # Wrapper tipis shebang menuju dist/bin/imgix.js
├── dist/                      # Direktori hasil build (JS terkompilasi)
│   └── bin/
│       └── imgix.js
├── e2e/                       # Skenario Pengujian End-to-End (E2E)
│   ├── auth.test.ts           # Pengujian untuk perintah auth
│   ├── purge.test.ts          # Pengujian untuk perintah purge
│   ├── source.test.ts         # Pengujian untuk perintah source
│   ├── assets.test.ts         # Pengujian untuk perintah assets
│   ├── url.test.ts            # Pengujian untuk perintah url
│   ├── diagnose.test.ts       # Pengujian untuk perintah diagnose
│   └── usage.test.ts          # Pengujian untuk perintah usage
├── src/                       # Source code utama (TypeScript)
│   ├── bin/                   # Entry point utama parser CLI (Commander)
│   │   └── imgix.ts
│   ├── pkg/                   # SDK / Modul inti yang independen & reusable
│   │   ├── api.ts             # Manajemen pemanggilan REST API imgix
│   │   ├── auth.ts            # Manajemen penyimpanan berkas kredensial global (~/.imgix-auth.json)
│   │   └── config.ts          # Parser parameter & prioritas konfigurasi (CLI > ENV > Global Auth)
│   ├── internal/              # Komponen khusus internal CLI
│   │   ├── ui/
│   │   │   └── prompts.ts     # Wrapper @clack/prompts untuk konsistensi UI
│   │   └── utils/
│   │       └── helper.ts      # Pembantu pembatasan laju (delay) dan format teks
│   └── cmd/                   # Implementasi sub-perintah
│       ├── auth.ts            # Manajemen autentikasi (setup, status, clear)
│       ├── purge.ts           # Logika pembersihan cache (purge --all)
│       ├── source.ts          # Integrasi daftar dan info Source
│       ├── assets.ts          # Eksplorasi & inspeksi file gambar
│       ├── url.ts             # Fungsi penandatanganan & optimasi kueri
│       ├── diagnose.ts        # Utilitas cek header CDN
│       └── usage.ts           # Statistik penggunaan & kuota
├── package.json               # Konfigurasi dependensi (tsup, @clack/prompts, picocolors)
├── tsconfig.json              # Aturan kompilasi TypeScript
└── tsup.config.ts             # Konfigurasi pembangun bundling untuk dist/
```

---

## Rencana Verifikasi

### Pengujian Otomatis
- Jalankan tipe pemeriksaan TypeScript: `pnpm run types:check`
- Jalankan proses build proyek: `pnpm run build`
- Jalankan tes E2E untuk memvalidasi fungsionalitas CLI: `pnpm run test:e2e`

### Verifikasi Manual
- Jalankan `imgix source list` dan pastikan data terunduh dengan benar.
- Jalankan `imgix url sign` dengan parameter custom dan periksa apakah tautan yang dihasilkan valid saat dibuka di browser.
- Jalankan `imgix diagnose` terhadap aset gambar imgix aktif untuk memastikan pembacaan header cache akurat.
