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

To manage or generate API keys, visit the [imgix API Keys Dashboard](https://dashboard.imgix.com/api-keys). For details on setting up keys and scopes, check the [Official API Key Setup Documentation](https://docs.imgix.com/apis/management/overview).

All other configurations (Source IDs, domains, and Secure URL Tokens) are resolved dynamically from the API at runtime.

Credentials are saved locally under `~/.imgix-auth.json` with secure owner-only permissions.

If a command requiring authentication is run and no API key is saved, the CLI will automatically trigger this wizard on the fly.

### Required API Key Scopes

For full functionality across all commands, your API key must be configured with the following permissions/scopes in your imgix dashboard:
- `Purge`: Required to clear asset caches.
- `Asset Manager Browse`: Required to query and inspect asset metadata.
- `Sources` (Read): Required to automatically resolve deployment domains.
- `Billing` (Read): Required to retrieve usage reports.

> [!TIP]
> Alternatively, you can use a master API Key with the "Account Admin" scope (which includes all permissions) to ensure seamless access to all commands without configuring individual permissions.

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

The CLI features a fully interactive wizard and checklist interface. If you run commands without arguments, the CLI will automatically fetch options from the API and guide you step-by-step using input boxes, dropdowns, and checklist prompts.

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
