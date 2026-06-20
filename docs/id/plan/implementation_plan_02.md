# Rencana Implementasi 02: Refaktorisasi dan Modularisasi Skrip Purge imgix

Rencana ini menjelaskan langkah-langkah untuk merefaktorisasi `src/purge.ts` dari satu file monolitik menjadi struktur modular dengan memisahkan kekhawatiran (konfigurasi, interaksi API, utilitas, dan eksekusi).

## Rekomendasi Arsitektur Modular

Kita akan membagi basis kode menjadi empat file terpisah untuk memastikan kohesi yang tinggi dan kopling yang rendah:
1. **`src/config.ts`**: Bertanggung jawab untuk memuat dan memvalidasi variabel lingkungan (`.env.local`) dan memecah argumen CLI.
2. **`src/utils.ts`**: Utilitas pembantu (misalnya, jeda batas laju dan normalisasi URL).
3. **`src/api.ts`**: Merangkum semua interaksi dengan imgix Management API (mengambil source, membuat daftar aset, mengirim permintaan POST purge).
4. **`src/purge.ts`**: Koordinator utama/titik masuk CLI yang mengontrol alur eksekusi, mengulang halaman, dan mencatat progres.

---

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> - **Nol Perubahan Perilaku**: Refaktorisasi akan mempertahankan semua fungsionalitas yang ada, termasuk pembatasan laju (3 permintaan per detik) dan keamanan dry-run secara default.
> - **Metode Eksekusi**: Anda akan tetap menjalankan skrip menggunakan `pnpm purge` (atau `pnpm purge --execute`).

---

## Rencana Perubahan

### Refaktorisasi Inti

#### [NEW] [config.ts](../../../src/config.ts)
- Definisikan antarmuka konfigurasi yang aman secara tipe data.
- Implementasikan pemuatan env menggunakan `dotenv`.
- Ekspor objek konfigurasi read-only termasuk `apiKey`, `sourceId`, `execute`, dan `dryRun`.

#### [NEW] [utils.ts](../../../src/utils.ts)
- Implementasikan utilitas pembantu `delay(ms)` untuk kontrol pembatasan laju.
- Implementasikan normalisasi URL (misalnya, menambahkan awalan garis miring dan menghapus garis miring ganda).

#### [NEW] [api.ts](../../../src/api.ts)
- Definisikan antarmuka respons untuk format JSON:API.
- Implementasikan `fetchSourceDomains(apiKey, sourceId)` untuk mengambil semua subdomain dan domain kustom.
- Implementasikan `fetchAssetsPage(apiKey, nextUrl)` untuk mengambil halaman aset.
- Implementasikan `submitPurgeRequest(apiKey, url)` untuk mengirim permintaan POST purge.

#### [MODIFY] [purge.ts](../../../src/purge.ts)
- Impor dari `config.ts`, `utils.ts`, dan `api.ts`.
- Bersihkan skrip eksekusi utama untuk fokus sepenuhnya pada alur perutean, pelaporan progres, dan loop eksekusi massal.

---

## Rencana Verifikasi

### Pengujian Otomatis
- Menjalankan skrip dalam mode dry-run menggunakan `pnpm purge` untuk memverifikasi bahwa impor modular berfungsi dan skrip mem-parse argumen dengan benar.

### Verifikasi Manual
- Memverifikasi log konsol untuk kebenaran dan memastikan tata letak sesuai dengan output skrip asli.
