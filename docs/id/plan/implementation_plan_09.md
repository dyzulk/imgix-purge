# Goal Description

Rencana 09 bertujuan untuk menyelesaikan masalah "Command Not Found" (`imgix-purge: The term 'imgix-purge' is not recognized...`) saat tahap development. 

Kita akan menyiapkan mekanisme agar Anda dapat "menginstal" (mendaftarkan) dan "mencabut" perintah `imgix-purge` secara global di perangkat Anda tanpa harus me-release atau mengunggahnya ke npmjs terlebih dahulu. Mekanisme ini menggunakan fitur *symlink* bawaan dari Node.js / pnpm.

## Proposed Changes

### 1. Menambahkan Script Bantuan
Saya akan menambahkan dua baris script baru di dalam `package.json` agar Anda tidak perlu repot menghafal perintah pnpm global.

#### [MODIFY] [package.json](../../../package.json)
- Menambahkan `"link:local": "pnpm link --global"` 
  (Berfungsi untuk membuat *shortcut* alias dari kode sumber Anda ke direktori global sistem Windows Anda).
- Menambahkan `"unlink:local": "pnpm rm --global imgix-purge"` 
  (Berfungsi untuk mencabut *shortcut* tersebut dan mengembalikan terminal ke kondisi bersih).

## Verification Plan

### Manual Verification
- Setelah disetujui, saya akan menambahkan script tersebut.
- Saya akan meminta Anda mengetik `pnpm run link:local` di terminal Anda.
- Setelah itu, Anda bisa mengetikkan perintah sakti `imgix-purge --help` di folder mana pun di komputer Anda!
- Jika Anda ingin membersihkannya, Anda cukup mengetik `pnpm run unlink:local`.
