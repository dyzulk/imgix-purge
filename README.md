# Unofficial imgix CLI

A fast, modular, and professional CLI companion tool to manage, purge, and diagnose imgix assets directly from your terminal.

---

## Features

- **Global Authentication Setup**: Configure once and run commands globally.
- **Bulk Cache Purging**: Purge all assets associated with a Source cache with automatic rate-limit throttling (3 requests per second).
- **Source Management**: List and inspect deep configurations of your imgix Sources.
- **Asset Exploration**: Retrieve, list, and inspect image metadata (supports both public render properties via `fm=json` and administrative Management API records).
- **Secure URL Signing**: Sign paths and query parameters locally using MD5 signatures.
- **URL Optimizer**: Analyze URL search parameters and receive automatic optimization recommendations.
- **CDN Cache Diagnostics**: Verify CDN cache status (Fastly/Cloudflare), headers, server compression, and get tuning suggestions.
- **Billing & Usage Reports**: Access daily credit consumption and bandwidth usage statistics.

---

## Installation

### Globally (Recommended)

Install the package globally using your preferred package manager:

```bash
pnpm add -g imgix-cli-unofficial
# or
npm install -g imgix-cli-unofficial
# or
yarn global add imgix-cli-unofficial
```

### In-Project Development

For local development or project-level commands:

```bash
pnpm install
pnpm run build
pnpm link:local
```

---

## Authentication Configuration

To use commands that query the imgix Management API, run the interactive setup wizard:

```bash
imgix auth setup
```

The wizard will prompt you to enter:
1. **imgix Management API Key**: (e.g. `ak_...`) - Required.
2. **imgix Source ID**: (e.g. `5ed5...`) - Required.
3. **Secure URL Token**: (e.g. `1a2b...`) - Optional (used for offline signing).

Credentials are saved locally under `~/.imgix-auth.json` with secure owner-only permissions.

To check your authentication status:

```bash
imgix auth status
```

To log out and delete global credentials:

```bash
imgix auth clear
```

---

## Command Reference

### Targeting Options

You can override global configuration per-command using these options:

| Flag | Env Variable | Description |
| :--- | :--- | :--- |
| `--api-key <key>` | `IMGIX_API_KEY` | Overrides saved imgix Management API Key |
| `--source-id <id>` | `IMGIX_SOURCE_ID` | Overrides saved imgix Source ID |
| `--secure-token <token>` | `IMGIX_SECURE_TOKEN` | Overrides saved Secure URL Token |
| `--domain <dom>` | `IMGIX_DOMAINS` | Specify target domain(s) manually (comma-separated) |

---

### Commands

#### Purge Assets

Purge all assets in the configured Source.

```bash
imgix purge [options]
```

- `-d, --dry-run`: Run in simulation mode (lists assets that would be purged without calling the Purge API).
- `--batch-size <num>`: Size of batches fetched per request (default: 10000).

---

#### Source Management

List and inspect your imgix Sources.

```bash
imgix source list
imgix source info [source-id]
```

---

#### Asset Exploration

Browse and inspect files.

```bash
imgix assets list [--cursor <cursor>]
imgix assets inspect <path> [options]
```

- `-a, --api`: Inspect administrative details from the Management API rather than public render properties (`fm=json`).

---

#### URL Manipulation

Sign paths locally or get optimization advice.

```bash
imgix url sign <path> [params]
imgix url optimize <url>
```

---

#### CDN Diagnostics

Analyze CDN cache headers and compression formats.

```bash
imgix diagnose <url>
```

---

#### Account Usage

Display billing and usage reports.

```bash
imgix usage status
```

---

## Development

To run TypeScript checks and E2E tests:

```bash
# Run typechecking
pnpm run types:check

# Run build
pnpm run build

# Run E2E tests
pnpm run test:e2e
```

---

## License

ISC License. This CLI is unofficial and not affiliated with, maintained, or endorsed by imgix.
