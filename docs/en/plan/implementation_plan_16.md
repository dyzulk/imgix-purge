# Implementation Plan 16: CLI Feature Escalation Plan for imgix (Unofficial)

This plan aims to realize the escalation ideas from `ide_eskalasi_cli.md` by adding the `source`, `assets`, `url`, `diagnose`, and `usage` subcommands under the new `imgix` CLI.

## User Review Required

> [!IMPORTANT]
> - **Secure URL Token Addition**: For the `url sign` feature, users must configure `IMGIX_SECURE_TOKEN` in `.env.local` or provide it during `imgix auth setup`.
> - **API Key Permissions**: The `source` and `usage` features require an API key with account setting read permissions (not just `Purge` or `Asset Manager Browse` permissions).

## Open Questions

> [!NOTE]
> 1. For the `assets inspect` feature, is it preferred to retrieve image metadata via the `fm=json` query parameter (served directly by the imgix rendering API) or through the management API? Using `fm=json` offers highly detailed EXIF data, pixel dimensions, bit depth, color profile, and original file metadata.
> 2. For the `usage` command, the imgix API restricts statistics access depending on the subscription plan. Should we implement an elegant fallback message if the API returns a 403 (Forbidden) status code?

---

## Proposed Changes

### Configuration and Setup

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Add support for reading `secureToken` (`IMGIX_SECURE_TOKEN`) from environment variables or global auth configuration fallbacks.

#### [MODIFY] [src/auth.ts](../../../src/auth.ts)
- Update the `AuthConfig` interface structure to include an optional `secureToken` field.

#### [MODIFY] [src/cmd/auth.ts](../../../src/cmd/auth.ts)
- Update the interactive `auth setup` wizard to query for `Secure URL Token` (optional, for URL signing).

---

### Core API Integration

#### [MODIFY] [src/api.ts](../../../src/api.ts)
- Implement `fetchSources(apiKey)`: Invokes `GET https://api.imgix.com/api/v1/sources`.
- Implement `fetchSourceDetail(apiKey, sourceId)`: Invokes `GET https://api.imgix.com/api/v1/sources/:source_id`.
- Implement `fetchBillingUsage(apiKey)`: Invokes usage statistics API if supported by the user's account type.

---

### CLI Command Implementations

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

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Register the new command groups (`source`, `assets`, `url`, `diagnose`, `usage`) into the root Commander parser.

### Unified Project Directory Structure (Modular Pattern)

Here is the illustration of the development layout and build output directory structure to support all the commands above:

```
imgix-cli-unofficial/
├── bin/                       # Compiled executable script (npm link entrypoint)
│   └── imgix.js               # Thin shebang wrapper pointing to dist/index.js
├── dist/                      # Build output directory (compiled JS)
│   └── index.js
├── src/                       # Main source code (TypeScript)
│   ├── index.ts               # Root CLI parser entry point (Commander)
│   ├── config.ts              # Parameter parser & configuration resolution (CLI > ENV > Global Auth)
│   ├── auth.ts                # Global credentials storage file manager (~/.imgix-auth.json)
│   ├── api.ts                 # REST API requests wrapper for imgix
│   ├── utils.ts               # Rate limit (delay) and text formatting utilities
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
- Create a new unit test file `e2e/commands.test.ts` to validate the invocation of the new command groups and argument handling.

### Manual Verification
- Run `imgix source list` and verify the data fetches successfully.
- Run `imgix url sign` with custom query parameters and check if the resulting link is valid in a browser.
- Run `imgix diagnose` against an active imgix image asset to verify cache header inspection accuracy.
