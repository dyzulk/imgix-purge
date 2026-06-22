# Unofficial imgix CLI

[![NPM Version](https://img.shields.io/npm/v/imgix-cli-unofficial.svg)](https://www.npmjs.com/package/imgix-cli-unofficial)
[![NPM Downloads](https://img.shields.io/npm/dm/imgix-cli-unofficial.svg)](https://www.npmjs.com/package/imgix-cli-unofficial)
[![Build Status](https://github.com/dyzulk/imgix-cli-unofficial/actions/workflows/publish.yml/badge.svg)](https://github.com/dyzulk/imgix-cli-unofficial/actions)
[![License](https://img.shields.io/github/license/dyzulk/imgix-cli-unofficial.svg)](https://github.com/dyzulk/imgix-cli-unofficial/blob/main/LICENSE)

A fast, modular, and professional CLI companion tool to manage, purge, and diagnose imgix assets directly from your terminal.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)
![imgix](https://img.shields.io/badge/imgix-FE8753?style=flat-square&logo=imgix&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

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
- **CLI Updates**: Easily check for updates and update the CLI directly from the terminal (supports automatic package manager detection).

---

## Installation

### Globally from npm (Default)

Install the package globally using your preferred package manager:

```bash
pnpm add -g imgix-cli-unofficial
# or
npm install -g imgix-cli-unofficial
# or
yarn global add imgix-cli-unofficial
```

<details>
<summary><b>Globally from GitHub Packages (Alternative)</b> (Click to expand)</summary>

You can also install the package from the GitHub Packages registry. This is useful as an alternative or mirror. The package is published under the `@dyzulk` scope.

> [!IMPORTANT]
> GitHub Packages requires authentication (a Personal Access Token with the `read:packages` scope) even to download and install public packages. Running the installation commands below without configuring authentication first will result in a `401 Unauthorized` error.

#### Step 1: Configure Authentication

Generate a GitHub Personal Access Token (classic) with the **`read:packages`** scope from your GitHub Settings -> Developer settings -> Personal access tokens.

You can configure this token in your `.npmrc` file via the CLI:

```bash
# For npm
npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

# For pnpm
pnpm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Alternatively, you can manually add it to your global configuration (typically in your `~/.npmrc` file):
```ini
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

#### Step 2: Choose Installation Method

##### Option A: Direct Command
Since all dependencies are bundled into the package distribution, you can install the package directly by specifying the registry flag:

```bash
npm install -g @dyzulk/imgix-cli-unofficial --registry=https://npm.pkg.github.com/
# or
pnpm add -g @dyzulk/imgix-cli-unofficial --registry=https://npm.pkg.github.com/
```

##### Option B: Configure Scope Registry (Recommended)
Configure your package manager to resolve the `@dyzulk` scope to the GitHub Packages registry:

```bash
# For npm
npm config set "@dyzulk:registry" "https://npm.pkg.github.com"

# For pnpm
pnpm config set "@dyzulk:registry" "https://npm.pkg.github.com"
```

Then install the package:

```bash
npm install -g @dyzulk/imgix-cli-unofficial
# or
pnpm add -g @dyzulk/imgix-cli-unofficial
# or
yarn global add @dyzulk/imgix-cli-unofficial
```

> [!TIP]
> **Troubleshooting on Windows/PowerShell**:
> If running `npm config set @dyzulk:registry` returns `is not a valid npm option` (commonly occurring due to trailing slash parsing in command prompts), wrap both the option name and the value in double quotes:
> ```bash
> npm config set "@dyzulk:registry" "https://npm.pkg.github.com"
> ```

</details>

### Switching Registries

If you want to switch between the npm version (`imgix-cli-unofficial`) and the GitHub Packages version (`@dyzulk/imgix-cli-unofficial`), you should reinstall the package using your package manager.

For example, to switch from the npm registry to the GitHub Packages registry (ensure you have configured your token in `.npmrc` first):

1. Uninstall the existing package:
   ```bash
   npm uninstall -g imgix-cli-unofficial
   ```
2. Install the new package from GitHub Packages:
   ```bash
   npm install -g @dyzulk/imgix-cli-unofficial --registry=https://npm.pkg.github.com/
   ```

To switch back to the npm registry:

1. Uninstall the GitHub Packages package:
   ```bash
   npm uninstall -g @dyzulk/imgix-cli-unofficial
   ```
2. Install the npm package:
   ```bash
   npm install -g imgix-cli-unofficial
   ```

The CLI's built-in update command (`imgix update`) automatically detects the registry and package scope it was installed with, ensuring that subsequent updates check and download from the correct registry.

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

The CLI features a hybrid interface supporting both **command arguments** for automation/scripts and an **interactive wizard/checklist interface** for ease of use. If you omit required arguments, the CLI will guide you step-by-step using input boxes, dropdowns, and checklist prompts.

---

<details>
<summary><b>Global Options</b> (Click to expand)</summary>

These options apply across all commands or tune execution behavior:

| Option / Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `-d, --dry-run` | Boolean | `false` | Runs commands (especially `purge`) in simulation mode. Lists targeted URLs without sending API mutations. |
| `--batch-size <num>` | Integer | `10000` | Sets the page size limit when retrieving assets from the API. |
| `-V, --version` | None | - | Outputs the version number of the installed CLI. |
| `-h, --help` | None | - | Displays the CLI help guide and lists all commands or specific flags. |

</details>

<details>
<summary><b>Credential Management (auth)</b> (Click to expand)</summary>

Configure and verify global credentials used to access the imgix Management API.

| Subcommand | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `setup` | None | None | Securely stores your API Key globally. | Prompts for API Key (`ak_...`). Saves to `~/.imgix-auth.json`. | `imgix auth setup` |
| `status` | None | None | Validates current credentials. | Checks key validity and displays active API scopes (e.g. `Purge`, `Billing`). | `imgix auth status` |
| `clear` | None | None | Logs out of your account. | Deletes local configuration file `~/.imgix-auth.json` immediately. | `imgix auth clear` |

</details>

<details>
<summary><b>Cache Clearing (purge)</b> (Click to expand)</summary>

Clear cached files on the imgix CDN edge servers.

| Command | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `purge` | None | `-d, --dry-run`<br>`--batch-size <num>` | Clears cache for selected Sources. | 1. Prompts to choose Source(s) (multi-select checklist).<br>2. Prompts to choose mode (**Bulk** or **Selective**). If Selective, prompts for comma-separated paths.<br>3. Prompts for final execution confirmation. | `imgix purge` |

#### Detailed Modes:
* **Bulk Purge**: Crawls the entire asset registry of the Source, resolves all associated domains, and purges all assets. Enforces a rate-limit safe delay of 350ms between requests (3 requests per second) to prevent API rate-limit errors. Not supported on manually configured Source domains.
* **Selective Purge**: Prompts for a list of paths (e.g., `/images/logo.png, icon.svg`). Normalizes paths and purges only those specified assets across the Source domains.

</details>

<details>
<summary><b>Source Config Management (source)</b> (Click to expand)</summary>

List and inspect configurations of your imgix Sources.

| Subcommand | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `list` | None | None | Lists all active Sources in the account. | Displays Name, ID, Type (e.g. S3, R2, Web Folder), and domains. | `imgix source list` |
| `info` | `[source-id]` *(Optional)* | None | Retrieves detailed config JSON of a Source. | If `[source-id]` is omitted, prompts you to select one from an interactive dropdown. | `imgix source info` |

</details>

<details>
<summary><b>Asset Exploration (assets)</b> (Click to expand)</summary>

Search and inspect files stored or registered in your imgix Sources.

| Subcommand | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `list` | None | `--cursor <cursor>` *(Optional)* | Lists up to 50 assets registered in your active Source. | Outputs relative paths. If more pages exist, prints a cursor token. | `imgix assets list --cursor 12345` |
| `inspect` | `<path>` *(Required)* | `-a, --api` *(Optional)* | Inspects metadata for a specific image file path. | If `<path>` is omitted, prompts you to enter it. By default, prompts you to choose the inspection mode. | `imgix assets inspect /images/banner.jpg` |
| `sync` | None | `--prefix <prefix>` *(Optional)* | Scans the origin storage bucket (AWS S3 or Cloudflare R2) and registers assets in the imgix Asset Manager. | 1. Prompts for Secret Access Key if not found in environment (`AWS_SECRET_ACCESS_KEY` or `R2_SECRET_ACCESS_KEY`).<br>2. Scans the bucket and displays total found count.<br>3. Presents an interactive menu to sync all, sync new only, filter by sub-prefix, or dry-run. | `imgix assets sync` |

#### Important Details:
* **Warning**: The `<path>` parameter must be a direct file path (e.g., `/images/banner.jpg`), NOT a folder or include the Source name.
* **Inspection Modes**:
  1. **Public Render Properties (via `fm=json`)**: Queries the public CDN URL to retrieve image details (dimensions, EXIF, colors). **Fails with HTTP 404** if the file does not exist or if path is a directory (e.g., `/goxstream/brands`).
  2. **Management API Record**: Queries the admin API for storage/ingest details. Skip the prompt with `-a` or `--api`.
* **Bucket Syncing & Credentials**:
  - The CLI fetches S3/R2 configurations (bucket name, endpoint, access key, source prefix) dynamically from the imgix Source details.
  - Plain-text secret access keys are not returned by the imgix Management API for security reasons. Provide your secret key via the environment variables `AWS_SECRET_ACCESS_KEY` (S3) or `R2_SECRET_ACCESS_KEY` (R2), or enter it securely when prompted by the interactive wizard.

</details>

<details>
<summary><b>URL Management & Optimization (url)</b> (Click to expand)</summary>

Analyze or generate signed URLs for secure deployments.

| Subcommand | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sign` | `<path>` *(Required)*<br>`[params]` *(Optional)* | None | Generates a secure signed URL locally using MD5. | If `<path>` or `[params]` are omitted, prompts you to enter them. Resolves target sources and secure tokens. | `imgix url sign /photo.jpg "w=800"` |
| `optimize` | `<url>` *(Required)* | None | Analyzes and suggests optimal parameters for an imgix URL. | If `<url>` is omitted, prompts you to enter a valid absolute URL. | `imgix url optimize https://my.imgix.net/photo.jpg?w=500` |

#### Detailed Analysis Output:
* Checks for automatic formatting and compression (`auto=format,compress`).
* Checks for Client Hints for responsive layout scaling (`ch=Width,DPR`).
* Warns if the URL is already signed (modifying parameters will invalidate the signature).

</details>

<details>
<summary><b>CDN Cache Diagnostics (diagnose)</b> (Click to expand)</summary>

Verify caching and server headers for any deployed image URL.

| Command | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `diagnose` | `<url>` *(Required)* | None | Analyzes HTTP caching headers and server compression. | If `<url>` is omitted, prompts you to enter a valid absolute URL. | `imgix diagnose https://my.imgix.net/photo.jpg` |

#### Diagnostic Checks Performed:
* **Connection Status**: HTTP response health.
* **Compression/Encoding**: Verifies if gzip/brotli is active.
* **CDN Cache Status**: Inspects Fastly caching headers (`X-Cache`, `Cache Hits`, `X-Served-By`) and Cloudflare caching headers (`CF-Cache-Status`).
* **Recommendations**: Alerts you if the asset has a cache miss, misses Cache-Control public cache instructions, or lacks gzip/brotli compression.

</details>

<details>
<summary><b>Billing & Resource Consumption (usage)</b> (Click to expand)</summary>

Display recent usage details for your imgix subscription.

| Subcommand | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `status` | None | None | Queries the billing endpoint of the Management API. | Displays the latest 5 generated usage and credit consumption reports. | `imgix usage status` |

#### Troubleshooting:
* **HTTP 403 Forbidden**: If this command fails with a 403 error, verify that your API Key is configured with the `Billing` read scope in your imgix dashboard.

</details>

<details>
<summary><b>CLI Updates (update)</b> (Click to expand)</summary>

Check for updates and update the CLI to the latest version.

| Subcommand / Alias | Arguments | Options / Flags | Description | Interactive Behavior | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `update` | None | None | Checks for updates and runs the package manager update script. | Prompts for confirmation if a newer version is available. | `imgix update` |
| `self-update` | None | None | Alias for `update`. | Same as `update`. | `imgix self-update` |

</details>

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
