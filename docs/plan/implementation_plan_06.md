# Implementation Plan 06: Rencana Arsitektur dan Pilihan Struktur CLI/SDK imgix-purge

Dokumen ini menjelaskan struktur arsitektur terpilih untuk pengembangan masa depan proyek `imgix-purge` menggunakan pola **Single-Repository Modular** (Opsi 1), serta menyajikan analisis mengenai fungsi dari direktori `e2e`, `bin`, dan `cmd` yang ditemukan pada repositori referensi (`render-cli`, `workers-sdk`, `vercel`).

---

## Keputusan Arsitektur Terpilih

Berdasarkan keputusan pengguna, proyek ini akan menggunakan **Opsi 1: Single-Repository Modular**. Pola ini dipilih karena efisiensinya untuk proyek utilitas tunggal (non-monorepo) tanpa menambah kompleksitas manajemen workspace.

### Struktur Direktori Akhir Proyek
```
imgix-purge/
├── src/
│   ├── bin/                 # Titik masuk utama eksekusi CLI (entry points)
│   │   └── imgix-purge.ts
│   ├── pkg/                 # Logika inti/SDK yang dapat diekspor secara publik
│   │   ├── api.ts           # Interaksi HTTP dengan Management API imgix
│   │   └── config.ts        # Parsing konfigurasi dan variabel lingkungan (.env)
│   └── internal/            # Logika khusus internal CLI (tidak diekspos untuk publik)
│       ├── commands/        # Modul sub-perintah CLI (browse, purge, status)
│       │   ├── browse.ts
│       │   └── purge.ts
│       └── ui/              # Tampilan visual terminal (table render, spinner)
│           └── output.ts
├── bin/                     # Script executable yang dipetakan ke npm "bin"
│   └── imgix-purge.js
├── e2e/                     # Pengujian End-to-End (E2E) untuk CLI terkompilasi
│   └── cli.test.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Analisis Fungsi Direktori `bin`, `cmd`, dan `e2e`

Mengapa repositori CLI besar seperti Wrangler (`workers-sdk`), Vercel, dan Render CLI selalu memiliki folder-folder ini? Berikut adalah penjelasannya:

### 1. Direktori `bin/` (Executables / Entrypoint Scripts)
* **Fungsi**: Berisi berkas skrip pengeksekusi utama yang akan dipanggil ketika pengguna menjalankan CLI dari terminal.
* **Mengapa Dibutuhkan**: 
  - Pada ekosistem Node.js, npm membutuhkan berkas pemula yang memiliki baris perintah *shebang* (`#!/usr/bin/env node` di baris pertama) untuk didaftarkan di bawah properti `"bin"` pada `package.json`.
  - Berkas di dalam folder `bin/` ini biasanya sangat tipis. Fungsinya hanya mengimpor modul utama yang sudah terkompilasi dari folder distribusi (seperti `dist/` atau `wrangler-dist/`) dan mengeksekusinya.
  - Ini memisahkan file eksekusi sistem operasi dari kode sumber pengembangan (`src/`).

### 2. Direktori `cmd/` (Go Command Pattern)
* **Fungsi**: Berisi titik masuk program untuk setiap perintah kompilasi (khusus untuk bahasa pemrograman Go seperti pada `render-cli`).
* **Mengapa Dibutuhkan**: 
  - Di ekosistem Go, terdapat konvensi standar tata letak proyek. Folder `cmd/` menampung aplikasi utama. Setiap subfolder di dalamnya (misal `cmd/render/`) akan menghasilkan satu file binary eksekutabel setelah proses kompilasi (`go build`).
  - Untuk proyek berbasis TypeScript/JavaScript, padanan dari `cmd/` adalah folder `src/bin/` atau `src/commands/` yang memisahkan pembacaan perintah input dari pengguna.

### 3. Direktori `e2e/` (End-to-End Testing)
* **Fungsi**: Digunakan untuk melakukan pengujian fungsionalitas menyeluruh (End-to-End) pada aplikasi CLI yang sudah dikompilasi.
* **Mengapa Dibutuhkan**:
  - **Pengujian Unit biasa (Unit Test)** hanya menguji satu fungsi secara terisolasi dan memotong (mock) panggilan jaringan API atau berkas sistem.
  - **Pengujian E2E** benar-benar menjalankan perintah CLI sesungguhnya (seperti menjalankan perintah `node ./bin/imgix-purge.js purge --all`) di dalam shell lingkungan pengujian terisolasi.
  - Pengujian ini memverifikasi interaksi asli dengan sistem operasi: apakah file `.env` dibaca dengan benar, apakah argumen CLI di-parse dengan benar, bagaimana CLI merespons jika API mengembalikan error asli, dan apakah program keluar dengan kode status keluar (exit code) yang benar (0 untuk sukses, 1 untuk gagal).

---

## Proposed Changes

#### [MODIFY] [package.json](file:///c:/Users/dyzulk/Documents/dyzulk/imgix-purge/package.json)
* Menambahkan dependensi `tsup` untuk kompilasi kode dari `src` ke `dist`.
* Menyesuaikan skrip `"build"`, `"dev"`, dan `"bin"` untuk mendukung eksekusi dari hasil kompilasi.

#### [NEW] [tsup.config.ts](file:///c:/Users/dyzulk/Documents/dyzulk/imgix-purge/tsup.config.ts)
* Membuat konfigurasi pembangun berkas JavaScript ESM tunggal dari berkas TypeScript.

#### [NEW] [bin/imgix-purge.js](file:///c:/Users/dyzulk/Documents/dyzulk/imgix-purge/bin/imgix-purge.js)
* Membuat berkas executable pembungkus (wrapper) yang mengarah ke `./dist/purge.js`.

---

## Verification Plan

### Automated Tests
- Menjalankan pemeriksaan tipe typescript: `pnpm run types:check`
- Menjalankan proses pembentukan kompilasi: `pnpm run build`
- Memastikan berkas output kompilasi di folder `dist/` terbentuk dengan benar dan dapat dijalankan langsung menggunakan Node.js.
