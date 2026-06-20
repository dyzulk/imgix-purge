# Rencana Implementasi 16: Rencana Eskalasi Fitur CLI imgix (Unofficial)

Rencana ini bertujuan untuk merealisasikan ide-ide eskalasi dari `ide_eskalasi_cli.md` dengan menambahkan sub-perintah `source`, `assets`, `url`, `diagnose`, dan `usage` di bawah CLI `imgix` yang baru.

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Penambahan Kunci Token Pengaman (`Secure URL Token`)**: Untuk fitur `url sign`, pengguna harus menambahkan `IMGIX_SECURE_TOKEN` di dalam `.env.local` atau memasukkannya saat melakukan `imgix auth setup`.
> - **Tuntutan Hak Akses Kunci API**: Fitur `source` dan `usage` membutuhkan kunci API dengan izin membaca setelan akun (bukan hanya izin `Purge` atau `Asset Manager Browse`).

## Pertanyaan Terbuka

> [!NOTE]
> 1. Apakah fitur `assets inspect` lebih disukai mengambil metadata gambar melalui parameter kueri `fm=json` (disediakan langsung oleh server render imgix) atau melalui API manajemen? Menggunakan `fm=json` memiliki keunggulan menyajikan data EXIF, dimensi piksel, kedalaman bit, profil warna, dan metadata asli gambar secara sangat detail.
> 2. Untuk perintah `usage`, API imgix membatasi akses statistik sesuai tingkat langganan. Apakah kami sebaiknya mengembalikan pesan penanganan yang elegan apabila API mengembalikan status 403 (Forbidden)?

---

## Rencana Perubahan

### Konfigurasi dan Setelan Awal

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Tambahkan dukungan pembacaan `secureToken` (`IMGIX_SECURE_TOKEN`) dari variabel lingkungan atau masukan fallback konfigurasi auth global.

#### [MODIFY] [src/auth.ts](../../../src/auth.ts)
- Perbarui struktur antarmuka `AuthConfig` untuk menyertakan bidang opsional `secureToken`.

#### [MODIFY] [src/cmd/auth.ts](../../../src/cmd/auth.ts)
- Perbarui wizard interaktif `auth setup` agar menanyakan `Secure URL Token` (opsional, untuk penandatanganan URL).

---

### Integrasi API Inti

#### [MODIFY] [src/api.ts](../../../src/api.ts)
- Implementasikan fungsi `fetchSources(apiKey)`: Memanggil `GET https://api.imgix.com/api/v1/sources`.
- Implementasikan fungsi `fetchSourceDetail(apiKey, sourceId)`: Memanggil `GET https://api.imgix.com/api/v1/sources/:source_id`.
- Implementasikan fungsi `fetchBillingUsage(apiKey)`: Memanggil API statistik penggunaan jika didukung oleh akun pengguna.

---

### Implementasi Perintah CLI

#### [NEW] [src/cmd/source.ts](../../../src/cmd/source.ts)
- Implementasikan sub-perintah `source list` dan `source info <source-id>` menggunakan tata letak estetika Clack.

#### [NEW] [src/cmd/assets.ts](../../../src/cmd/assets.ts)
- Implementasikan sub-perintah `assets list` (menelusuri berkas dengan paginasi sederhana) dan `assets inspect <path>` (meminta format json render imgix `fm=json` untuk merender metadata berkas gambar secara detail).

#### [NEW] [src/cmd/url.ts](../../../src/cmd/url.ts)
- Implementasikan sub-perintah `url sign <path> [params]` menggunakan algoritma MD5 lokal untuk menempelkan tanda tangan keamanan (`s=...`).
- Implementasikan sub-perintah `url optimize <url>` untuk menganalisis dan merekomendasikan penambahan kueri parameter optimasi otomatis.

#### [NEW] [src/cmd/diagnose.ts](../../../src/cmd/diagnose.ts)
- Implementasikan sub-perintah `diagnose <url>` dengan mengirimkan HTTP `HEAD`/`GET` request, mengurai header cache (`X-Cache`, `CF-Cache-Status`), status kompresi, dan metode rendering.

#### [NEW] [src/cmd/usage.ts](../../../src/cmd/usage.ts)
- Implementasikan sub-perintah `usage status` untuk menampilkan grafik penggunaan bandwidth dan rendering request.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Daftarkan grup perintah kustom baru (`source`, `assets`, `url`, `diagnose`, `usage`) ke dalam parser Commander utama.

### Struktur Direktori Proyek Terpadu (Pola Modular)

Berikut adalah ilustrasi tata letak folder pengembangan (*development*) dan hasil kompilasi (*build*) untuk mendukung seluruh perintah di atas:

```
imgix-cli-unofficial/
├── bin/                       # Skrip eksekusi terkompilasi (npm link entrypoint)
│   └── imgix.js               # Wrapper tipis shebang menuju dist/index.js
├── dist/                      # Direktori hasil build (JS terkompilasi)
│   └── index.js
├── src/                       # Source code utama (TypeScript)
│   ├── index.ts               # Entry point utama parser CLI (Commander)
│   ├── config.ts              # Parser parameter & prioritas konfigurasi (CLI > ENV > Global Auth)
│   ├── auth.ts                # Manajemen penyimpanan berkas kredensial global (~/.imgix-auth.json)
│   ├── api.ts                 # Manajemen pemanggilan REST API imgix
│   ├── utils.ts               # Pembantu pembatasan laju (delay) dan format teks
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
- Buat berkas tes unit baru `e2e/commands.test.ts` untuk memvalidasi pemanggilan baris perintah baru dan asersi kelancaran argumen.

### Verifikasi Manual
- Jalankan `imgix source list` dan pastikan data terunduh dengan benar.
- Jalankan `imgix url sign` dengan parameter custom dan periksa apakah tautan yang dihasilkan valid saat dibuka di browser.
- Jalankan `imgix diagnose` terhadap aset gambar imgix aktif untuk memastikan pembacaan header cache akurat.
