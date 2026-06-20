# Goal Description

Rencana 14 bertujuan untuk merestrukturisasi folder dokumentasi perencanaan (`docs/plan`) agar mematuhi standar repositori multibahasa (*bilingual*) proyek ini. Semua file perencanaan yang ada saat ini (13 file yang ditulis dalam bahasa Indonesia) akan dipindahkan ke dalam folder `docs/id/plan`. Selanjutnya, seluruh 13 dokumen tersebut akan diterjemahkan ke dalam bahasa Inggris dan disimpan di dalam `docs/en/plan`.

## Proposed Changes

### 1. Migrasi Dokumen Asli (Bahasa Indonesia)
Kita akan memindahkan semua file dari folder lama ke struktur bahasa Indonesia.

#### [NEW] [docs/id/plan/](../../../docs/id/plan)
- Direktori baru untuk menyimpan dokumen bahasa Indonesia.

#### [DELETE] [docs/plan/](../../../docs/plan)
- Direktori lama akan dihapus setelah semua isi dipindahkan menggunakan perintah `git mv docs/plan docs/id/plan`.

### 2. Penyesuaian Tautan Relatif (Bahasa Indonesia)
Memperbaiki tautan *hyperlink* pada dokumen bahasa Indonesia yang sudah dipindahkan.

#### [MODIFY] `docs/id/plan/*.md`
- Menjalankan skrip *find-and-replace* untuk mengubah pola tautan file relatif dari dua level naik (`../../`) menjadi tiga level naik (`../../../`).

### 3. Penerjemahan Dokumen (Bahasa Inggris)
Membuat salinan dari semua 13 rencana implementasi dalam bahasa Inggris.

#### [NEW] [docs/en/plan/implementation_plan_01.md](../../../docs/en/plan/implementation_plan_01.md)
#### [NEW] [docs/en/plan/implementation_plan_02.md](../../../docs/en/plan/implementation_plan_02.md)
*(... hingga `implementation_plan_13.md`)*
- Menerjemahkan isi teks, daftar langkah, serta deskripsi perubahan ke dalam bahasa Inggris teknis (*Technical English*).
- Menyesuaikan tautan referensi *hyperlink* secara akurat.

## Verification Plan

### Manual Verification
- Anda bisa membuka direktori `docs/id/plan/` dan `docs/en/plan/` di editor teks Anda, dan mengecek secara acak apakah terjemahannya sudah profesional dan *hyperlink*-nya masih bisa diklik menuju ke *source code* yang benar.
