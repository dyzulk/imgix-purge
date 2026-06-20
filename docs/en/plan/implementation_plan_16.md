# Implementation Plan 16: CLI Feature Escalation Plan for imgix (Unofficial)

This plan aims to realize the escalation ideas from `ide_eskalasi_cli.md` by adding the `source`, `assets`, `url`, `diagnose`, and `usage` subcommands under the new `imgix` CLI, as well as restructuring files into a unified modular folder pattern (`src/bin`, `src/pkg`, `src/internal`).

## User Review Required

> [!IMPORTANT]
> - **Source File Restructuring**: We will relocate files inside `src/` to new subfolders (`bin`, `pkg`, `internal`) to improve code organization.
> - **Secure URL Token Addition**: For the `url sign` feature, users must configure `IMGIX_SECURE_TOKEN` in `.env.local` or provide it during `imgix auth setup`.
> - **API Key Permissions**: The `source` and `usage` features require an API key with account setting read permissions (not just `Purge` or `Asset Manager Browse` permissions).

## Open Questions

> [!NOTE]
> 1. For the `assets inspect` feature, is it preferred to retrieve image metadata via the `fm=json` query parameter (served directly by the imgix rendering API) or through the management API? Using `fm=json` offers highly detailed EXIF data, pixel dimensions, bit depth, color profile, and original file metadata.
> 2. For the `usage` command, the imgix API restricts statistics access depending on the subscription plan. Should we implement an elegant fallback message if the API returns a 403 (Forbidden) status code?

---

## Proposed Changes

### 1. Source File Reorganization (Restructuring)

We will relocate source files to the modular layout:

#### [NEW] [src/bin/imgix.ts](../../../src/bin/imgix.ts)
- Relocate from `src/index.ts`. This serves as the root entry point of the CLI.

#### [NEW] [src/pkg/config.ts](../../../src/pkg/config.ts)
- Relocate from `src/config.ts`. Add support for reading `secureToken` (`IMGIX_SECURE_TOKEN`).

#### [NEW] [src/pkg/auth.ts](../../../src/pkg/auth.ts)
- Relocate from `src/auth.ts`. Update `AuthConfig` to include an optional `secureToken` field.

#### [NEW] [src/pkg/api.ts](../../../src/pkg/api.ts)
- Relocate from `src/api.ts`. Add new API integrations (`fetchSources`, `fetchSourceDetail`, `fetchBillingUsage`).

#### [NEW] [src/internal/utils/helper.ts](../../../src/internal/utils/helper.ts)
- Relocate from `src/utils.ts`. Provides delay and normalization helpers.

#### [DELETE] Old Files in `src/` Root
- Delete `src/index.ts`, `src/config.ts`, `src/auth.ts`, `src/api.ts`, and `src/utils.ts` after they are successfully relocated.

---

### 2. Configuration & Build Adjustments

#### [MODIFY] [package.json](../../../package.json)
- Update the `"dev"` script to `"tsx src/bin/imgix.ts"`.

#### [MODIFY] [bin/imgix.js](../../../bin/imgix.js)
- Change target import path from `../dist/index.js` to `../dist/bin/imgix.js`.

#### [MODIFY] [tsup.config.ts](../../../tsup.config.ts)
- Adjust the entry point compiler target to `src/bin/imgix.ts` and set output options to compile into `dist/bin/imgix.js`.

---

### 3. New CLI Command Implementations

#### [NEW] [src/cmd/source.ts](../../../src/cmd/source.ts)
- Implement `source list` and `source info <source-id>` subcommands using the Clack interface.

#### [NEW] [src/cmd/assets.ts](../../../src/cmd/assets.ts)
- Implement `assets list` (browsing files with simple pagination) and `assets inspect <path>` (requesting the imgix rendering format `fm=json` to output detailed image file metadata).

#### [NEW] [src/cmd/url.ts](../../../src/cmd/url.ts)
- Implement `url sign <path> [params]` using a local MD5 signing algorithm to append the secure signature parameter (`s=...`).
- Implement `url optimize <url>` to analyze and suggest automatic optimization query parameters.

#### [NEW] [src/cmd/diagnose.ts](../../../src/cmd/diagnose.ts)
- Implement `diagnose <url>` by executing a HTTP `HEAD`/`GET` request, parsing cache headers (`X-Cache`, `CF-Cache-Status`), compression status, and rendering methods.

#### [NEW] [src/cmd/usage.ts](../../../src/cmd/usage.ts)
- Implement `usage status` to output bandwidth consumption and rendering request trends.

---

### Unified Project Directory Structure (Modular Pattern)

Here is the illustration of the development layout and build output directory structure to support all the commands above:

```
imgix-cli-unofficial/
├── bin/                       # Compiled executable script (npm link entrypoint)
│   └── imgix.js               # Thin shebang wrapper pointing to dist/bin/imgix.js
├── dist/                      # Build output directory (compiled JS)
│   └── bin/
│       └── imgix.js
├── src/                       # Main source code (TypeScript)
│   ├── bin/                   # Entry point utama parser CLI (Commander)
│   │   └── imgix.ts
│   ├── pkg/                   # SDK / Modul inti yang independen & reusable
│   │   ├── api.ts             # Manajemen pemanggilan REST API imgix
│   │   ├── auth.ts            # Manajemen penyimpanan berkas kredensial global (~/.imgix-auth.json)
│   │   └── config.ts          # Parser parameter & prioritas konfigurasi (CLI > ENV > Global Auth)
│   ├── internal/              # Komponen khusus internal CLI
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
├── tsconfig.json              # TypeScript compiler options
└── tsup.config.ts             # Bundler build config file for dist/
```

---

## Verification Plan

### Automated Tests
- Run TypeScript type checking: `pnpm run types:check`
- Run the build process: `pnpm run build`
- Run E2E tests to validate CLI invocation changes: `pnpm run test:e2e`

### Manual Verification
- Run `imgix source list` and verify the data fetches successfully.
- Run `imgix url sign` with custom query parameters and check if the resulting link is valid in a browser.
- Run `imgix diagnose` against an active imgix image asset to verify cache header inspection accuracy.
