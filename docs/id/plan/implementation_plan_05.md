# Rencana Implementasi 05: Skrip Pemeriksaan Tipe dan Konfigurasi Metadata Paket npmjs

Rencana ini menjelaskan langkah-langkah untuk mengisi semua bidang metadata standar dalam `package.json` untuk memastikan detail paket lengkap dan patuh dengan registri npmjs saat diterbitkan.

## Rencana Perubahan

### Konfigurasi package.json

#### [MODIFY] [package.json](../../../package.json)
- Isi semua bidang metadata registri standar:
  - `"description"`: `"A CLI tool to bulk purge all assets in an imgix Source cache."`
  - `"keywords"`: `["imgix", "purge", "cache", "cdn", "bulk-purge", "cloudflare-r2"]`
  - `"author"`: `"dyzulk"`
  - `"repository"`:
    ```json
    "repository": {
      "type": "git",
      "url": "git+https://github.com/dyzulk/imgix-purge.git"
    }
    ```
  - `"bugs"`:
    ```json
    "bugs": {
      "url": "https://github.com/dyzulk/imgix-purge/issues"
    }
    ```
  - `"homepage"`: `"https://github.com/dyzulk/imgix-purge#readme"`
  - `"publishConfig"`:
    ```json
    "publishConfig": {
      "registry": "https://registry.npmjs.org/",
      "access": "public"
    }
    ```
- Pastikan skrip `"types:check": "tsc --noEmit"` terdaftar.

---

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **URL Repositori Git**: Kami berasumsi format URL repositori didasarkan pada nama ruang kerja Anda (`imgix-purge`) dan penulis (`dyzulk`). Jika Anda menggunakan URL hosting Git atau namespace yang berbeda, silakan perbarui bidang ini.
> - **Pesan Komit**: Kami mengusulkan pesan komit `chore: populate all standard npmjs metadata fields in package.json`.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Verifikasi `git status` setelah komit untuk memastikan ruang kerja bersih.
- Tambahkan `package.json` yang dimodifikasi ke stage: `git add package.json`
- Buat komit: `git commit -m "chore: populate all standard npmjs metadata fields in package.json"`
