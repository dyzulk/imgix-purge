# Implementation Plan 16: CLI Feature Escalation Plan for imgix (Unofficial)

This plan aims to realize the escalation ideas from `ide_eskalasi_cli.md` by adding the `source`, `assets`, `url`, `diagnose`, and `usage` subcommands under the new `imgix` CLI, as well as restructuring files into a unified modular folder pattern (`src/bin`, `src/pkg`, `src/internal`).

## User Review Required

> [!IMPORTANT]
> - **Source File Restructuring**: We will relocate files inside `src/` to new subfolders (`bin`, `pkg`, `internal`) to improve code organization.
> - **Global Credentials Alignment (`auth setup`)**: The interactive `imgix auth setup` wizard will be updated to prompt for the API Key, Source ID, and Secure URL Token all at once and save them in `~/.imgix-auth.json`.
> - **API Key Permissions**: To run all CLI commands smoothly, using a single API Key with full scopes enabled (Admin) is recommended, or minimally having the following scopes: `Purge`, `Asset Manager Browse`, `Sources` (Read), and `Billing` (Read).
> - **Usage Command 403 Forbidden Handling**: If the API returns a 403 (Forbidden) code, the CLI will output a friendly informational notice explaining that the API Key lacks `Billing` scope or the account tier does not support metrics.

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

#### [NEW] [src/internal/ui/prompts.ts](../../../src/internal/ui/prompts.ts)
- Create custom UI prompts utility module wrapping `@clack/prompts` to ensure consistent terminal visualization.

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
- Implement `assets list` (browsing files with simple pagination).
- Implement `assets inspect <path>` with two separate options:
  - **By default**: Request image file metadata (EXIF, resolution, colors) from the rendering engine using the `fm=json` query parameter, which requires no authentication.
  - **API Flag (`--api` / `-a`)**: Query the imgix Management API to retrieve administrative file details from the Asset Manager.

#### [NEW] [src/cmd/url.ts](../../../src/cmd/url.ts)
- Implement `url sign <path> [params]` using a local MD5 signing algorithm to append the secure signature parameter (`s=...`).
- Implement `url optimize <url>` to analyze and suggest automatic optimization query parameters.

#### [NEW] [src/cmd/diagnose.ts](../../../src/cmd/diagnose.ts)
- Implement `diagnose <url>` by executing a HTTP `HEAD`/`GET` request, parsing cache headers (`X-Cache`, `CF-Cache-Status`), compression status, and rendering methods.

#### [NEW] [src/cmd/usage.ts](../../../src/cmd/usage.ts)
- Implement `usage status` to output bandwidth consumption and rendering request trends, including graceful handling for 403 status codes.

---

### 4. End-to-End (E2E) Testing

#### [NEW] [e2e/auth.test.ts](../../../e2e/auth.test.ts)
- Create a new E2E test scenario file to validate the `imgix auth` command group (setup, status, clear).

#### [NEW] [e2e/source.test.ts](../../../e2e/source.test.ts)
- Create a new E2E test scenario file to validate the `imgix source` command group (list, info).

#### [NEW] [e2e/assets.test.ts](../../../e2e/assets.test.ts)
- Create a new E2E test scenario file to validate the `imgix assets` command group (list, inspect).

#### [NEW] [e2e/url.test.ts](../../../e2e/url.test.ts)
- Create a new E2E test scenario file to validate the `imgix url` command group (sign, optimize).

#### [NEW] [e2e/diagnose.test.ts](../../../e2e/diagnose.test.ts)
- Create a new E2E test scenario file to validate the `imgix diagnose` command.

#### [NEW] [e2e/usage.test.ts](../../../e2e/usage.test.ts)
- Create a new E2E test scenario file to validate the `imgix usage` command.

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
├── e2e/                       # End-to-End (E2E) Test Scenarios
│   ├── auth.test.ts           # Authentication command tests
│   ├── purge.test.ts          # Cache purging command tests
│   ├── source.test.ts         # Source command tests
│   ├── assets.test.ts         # Assets command tests
│   ├── url.test.ts            # URL utilities command tests
│   ├── diagnose.test.ts       # CDN cache header diagnostics tests
│   └── usage.test.ts          # Usage metrics command tests
├── src/                       # Main source code (TypeScript)
│   ├── bin/                   # Entry point utama parser CLI (Commander)
│   │   └── imgix.ts
│   ├── pkg/                   # SDK / Modul inti yang independen & reusable
│   │   ├── api.ts             # REST API requests wrapper for imgix
│   │   ├── auth.ts            # Global credentials storage file manager (~/.imgix-auth.json)
│   │   └── config.ts          # Parameter parser & configuration resolution (CLI > ENV > Global Auth)
│   ├── internal/              # Internal helper components
│   │   ├── ui/
│   │   │   └── prompts.ts     # Wrapper @clack/prompts for UI consistency
│   │   └── utils/
│   │       └── helper.ts      # Rate limit (delay) and text formatting utilities
│   └── cmd/                   # Subcommands implementation modules
│       ├── auth.ts            # Authentication manager (setup, status, clear)
│       ├── purge.ts           # Cache purge logic handler (purge --all)
│       ├── source.ts          # Source query and information integration
│       ├── assets.ts          # Image assets list explorer & inspector
│       ├── url.ts             # URL signing & query parameter optimization
│       ├── diagnose.ts        # CDN cache header diagnostics utility
│       └── usage.ts           # Usage metrics & quota dashboard
├── package.json               # Dependency configuration (tsup, @clack/prompts, picocolors)
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
