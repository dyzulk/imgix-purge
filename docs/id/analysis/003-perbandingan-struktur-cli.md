# Analisis Perbandingan Struktur Arsitektur CLI Node.js

Dokumen ini menyajikan analisis perbandingan antara struktur proyek Command Line Interface (CLI) standar yang didistribusikan melalui npmjs (seperti Wrangler CLI, Vercel CLI, Render CLI) dengan struktur skrip eksekusi langsung (menggunakan `tsx` atau `ts-node`), serta memberikan rekomendasi kelayakan untuk proyek `imgix-purge`.

---

## 1. Perbandingan Struktur Proyek

Secara umum, perkakas CLI modern berbasis Node.js yang dipublikasikan ke registri npm menggunakan pemisah antara kode sumber pembangunan (development source) dan berkas distribusi hasil kompilasi (distribution build).

Berikut adalah perbandingan karakteristik antara pola standar CLI industri dengan pola skrip langsung yang saat ini digunakan:

| Karakteristik | Pola CLI Standar (Wrangler, Vercel, dll.) | Pola Skrip Langsung (imgix-purge Saat Ini) |
| :--- | :--- | :--- |
| **Folder Kode Sumber (`src`)** | Ada. Memisahkan logika CLI, utilitas, API, dan pengujian secara rapi. | Ada. Digunakan untuk menyimpan kode TypeScript. |
| **Folder Distribusi (`dist`)** | Ada. Berisi berkas JavaScript (`.js` atau `.mjs`) hasil kompilasi/minifikasi. | Tidak ada. Mengeksekusi berkas `.ts` secara langsung saat runtime. |
| **Metode Eksekusi** | Menjalankan berkas JavaScript yang telah dikompilasi menggunakan Node.js secara langsung. | Menjalankan berkas TypeScript menggunakan pustaka tambahan seperti `tsx` secara real-time. |
| **Kecepatan Mulai (Startup Time)** | Sangat Cepat (Instant). Tanpa proses kompilasi tambahan saat perintah dijalankan. | Lebih Lambat. Membutuhkan waktu tambahan (overhead) untuk kompilasi TypeScript ke JavaScript saat runtime. |
| **Ketergantungan Pengguna** | Rendah. Pengguna hanya membutuhkan Node.js runtime untuk menjalankannya. | Tinggi. Pengguna harus menginstal alat pendukung kompilasi (seperti `tsx` atau `ts-node`) sebagai dependensi proyek. |
| **Ukuran Paket npm** | Kecil. Hanya berkas hasil kompilasi yang dipublikasikan (berkas `.ts` dan berkas pengujian diabaikan). | Lebih Besar jika seluruh berkas mentah TypeScript dan utilitas pembangun dipublikasikan. |
| **Kemudahan Penamaan Kembali** | Sangat Mudah. Cukup mengganti konfigurasi `"bin"` di `package.json` yang mengarah ke berkas distribusi. | Cukup Mudah, namun konfigurasi pengeksekusi runtime harus selalu disesuaikan. |

---

## 2. Mengapa CLI Standar Menggunakan Arsitektur `src` & `dist`?

Ada beberapa alasan teknis mengapa alat seperti `wrangler` atau `vercel` menerapkan pemisahan ini:

### A. Kinerja Awal (Bootstrapping Performance)
Aplikasi CLI sangat sensitif terhadap waktu mulai (latency startup). Jika sebuah CLI membutuhkan waktu lebih dari 200ms hanya untuk menampilkan menu bantuan (`--help`), pengguna akan merasakan lag. 
- Dengan mengompilasi TypeScript menjadi JavaScript biasa di folder `dist/` sebelum dipublikasikan, Node.js dapat langsung mengeksekusi kode tersebut tanpa overhead kompilasi instan.

### B. Ketersediaan Lingkungan Runtime Pengguna
Node.js secara bawaan tidak dapat mengeksekusi berkas `.ts` secara langsung tanpa flag khusus atau pustaka pihak ketiga.
- Jika Anda mendistribusikan kode sumber `.ts` langsung ke pengguna akhir melalui npm, pengguna tersebut harus memasang dependensi tambahan untuk menjalankannya.
- Dengan menerbitkan hasil kompilasi di `dist/` berupa berkas `.js` standard, CLI Anda dijamin dapat berjalan di semua lingkungan yang memiliki Node.js terinstal, tanpa ketergantungan compiler.

### C. Bundling dan Tree-Shaking
Alat pembangun modern seperti `tsup`, `esbuild`, atau `rollup` dapat menyatukan (bundle) semua pustaka pihak ketiga dan kode internal ke dalam satu berkas JavaScript tunggal. Ini membantu meminimalkan proses instalasi (`npm install`) dari dependensi yang sangat banyak (node_modules yang gemuk) sehingga proses instalasi CLI menjadi jauh lebih cepat.

---

## 3. Rekomendasi Untuk Proyek `imgix-purge`

Apakah direkomendasikan bagi proyek `imgix-purge` untuk mengadopsi pola standar ini?

**Ya, sangat direkomendasikan**, terutama jika di masa mendatang Anda berencana untuk:
1. **Mengubah Nama CLI**: Misalnya mengubah nama perintah dari `imgix-purge` menjadi `ix-purge` atau nama yang lebih pendek.
2. **Menambahkan Fitur Baru**: Seperti fitur interaktif (menggunakan `prompts` untuk memilih file), parsing argumen tingkat lanjut (menggunakan `commander` atau `cac`), serta format output yang variatif (seperti format JSON, tabel, dll.).
3. **Mempublikasikannya ke npmjs**: Agar pengguna lain dapat menginstalnya secara global (`npm install -g imgix-purge`) atau menjalankannya langsung melalui npx (`npx imgix-purge`).

---

## 4. Rencana Langkah Migrasi Struktur `imgix-purge`

Jika Anda ingin menerapkan perubahan ini, berikut adalah panduan langkah yang disarankan:

### Langkah A: Konfigurasi Tooling Bundler (Direkomendasikan: `tsup`)
`tsup` adalah pembangun berbasis `esbuild` yang sangat cepat dan sangat mudah dikonfigurasi untuk membuat paket CLI atau pustaka Node.js.

1. Pasang `tsup` sebagai dependensi pengembangan:
   ```bash
   pnpm add -D tsup
   ```

2. Buat berkas konfigurasi `tsup.config.ts` di direktori utama:
   ```typescript
   import { defineConfig } from "tsup";

   export default defineConfig({
     entry: ["src/purge.ts"],
     format: ["esm"],
     dts: false,
     clean: true,
     minify: true,
     sourcemap: false
   });
   ```

### Langkah B: Perbarui `package.json`
Perbarui konfigurasi agar menunjuk ke hasil kompilasi pada folder `dist/`:

```json
{
  "name": "imgix-purge",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/purge.js",
  "bin": {
    "imgix-purge": "./dist/purge.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "pnpm build",
    "imgix-purge": "node dist/purge.js",
    "dev": "tsx src/purge.ts",
    "types:check": "tsc --noEmit"
  }
}
```

> [!NOTE]
> - Konfigurasi `"bin"` di atas mendefinisikan bahwa ketika pengguna menginstal paket ini, npm akan membuat tautan (symlink) dari perintah `imgix-purge` ke berkas `./dist/purge.js`.
> - Properti `"files": ["dist"]` memastikan bahwa hanya folder `dist` (dan berkas wajib seperti `package.json`, `README.md`) yang diunggah ke npmjs, sehingga menjaga ukuran unduhan tetap sangat ringan.

### Langkah C: Penyesuaian Berkas Utama (`src/purge.ts`)
Pastikan pada baris paling pertama di berkas entri utama Anda (`src/purge.ts`) terdapat deklarasi *shebang* agar sistem operasi mengetahui bahwa berkas ini harus dijalankan menggunakan Node.js:
```typescript
#!/usr/bin/env node

// Kode utama Anda di sini...
```

Dengan struktur ini, proyek Anda akan sepenuhnya siap untuk dikembangkan lebih lanjut dengan performa optimal dan kompatibilitas penuh dengan standar ekosistem npmjs.
