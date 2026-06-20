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

The CLI features a hybrid interface supporting both **command arguments** for automation/scripts and an **interactive wizard/checklist interface** for ease of use. If you omit required arguments, the CLI will guide you step-by-step using input boxes, dropdowns, and checklist prompts.

---

### Global Options

These options apply across all commands or tune execution behavior:

* `-d, --dry-run`
  * **Description**: Runs commands (especially `purge`) in simulation mode.
  * **Behavior**: Displays the URLs that would be targeted, but does not execute the actual network mutation requests (e.g. it prints the purge candidates without making the purge API calls).
* `--batch-size <num>` (Default: `10000`)
  * **Description**: Sets the maximum size of asset pages retrieved per request when listing or batch processing assets.
* `-V, --version`
  * **Description**: Outputs the version number of the installed CLI (`1.0.0`).
* `-h, --help`
  * **Description**: Displays the command-line help interface and lists all available commands or command-specific flags.

---

### Commands & Subcommands

#### `auth` — Credential Management

Configure and verify global credentials used to access the imgix Management API.

##### `imgix auth setup`
* **Description**: Runs an interactive configuration wizard.
* **Flow**: Prompts you for your **imgix Management API Key** (starts with `ak_`).
* **Storage**: Encrypts and saves your credentials locally in `~/.imgix-auth.json` with secure, owner-only file permissions (read/write only by your system user).
* **On-the-fly Trigger**: If you execute any command requiring authentication without having set up credentials, this setup wizard will trigger automatically.

##### `imgix auth status`
* **Description**: Validates your current credentials against the imgix Management API.
* **Output**: Displays the status of your connection and the scopes granted to your API Key (e.g. `Purge`, `Asset Manager Browse`, `Sources`, `Billing`).

##### `imgix auth clear` (Alias: `logout`)
* **Description**: Logs out of your account.
* **Behavior**: Permanently deletes the local configuration file `~/.imgix-auth.json`.

---

#### `purge` — Cache Clearing

Clear cached files on the imgix CDN edge servers.

##### `imgix purge [options]`
* **Arguments**: None (completely interactive flow).
* **Execution Flow**:
  1. **Select Source(s)**: Displays a multi-select checklist of all active imgix Sources. You can select one or multiple sources.
  2. **Select Purge Mode**:
     * **Bulk Purge**: Crawls through the entire asset registry of the selected Source(s), resolves all domains associated with those Sources, and purges every asset. Safe rate-limiting (3 requests per second) is enforced to prevent API throttling. *(Note: Bulk Purge is not supported on manually configured Source domains)*.
     * **Selective Purge**: Prompts you to input one or more relative file paths separated by commas (e.g., `/images/avatar.jpg, /logo.svg`).
  3. **Confirmation**: Prompts you to confirm execution before submitting the requests.
* **Flags Supported**: Supports the global `-d, --dry-run` flag to list resolved URLs without sending actual purge requests.

---

#### `source` — Source Configuration Management

List and inspect the configurations of your imgix Sources.

##### `imgix source list`
* **Description**: Contacts the Management API and lists all configured Sources under your account.
* **Output**: Displays a table showing the Source Name, Source ID, Source Type (e.g., Amazon S3, Web Folder, Cloudflare R2), and all associated custom deployment domains.

##### `imgix source info [source-id]`
* **Arguments**:
  * `[source-id]` (Optional): The unique ID of the imgix Source you want to inspect.
* **Behavior**: If the `[source-id]` argument is omitted, the CLI displays an interactive dropdown list for you to select a Source.
* **Output**: Displays the raw, detailed configuration JSON of the Source directly in the terminal (useful for checking secure tokens, path prefixes, and storage credentials).

---

#### `assets` — Asset Directory Exploration

Search and inspect files stored or registered in your imgix Sources.

##### `imgix assets list`
* **Options**:
  * `--cursor <cursor>` (Optional): The pagination token for the next page of results.
* **Behavior**: Retrieves a list of up to 50 assets registered in your active Source.
* **Output**: Lists the relative origin paths of your assets and prints the cursor token for the next page. If there is a next page, run:
  ```bash
  imgix assets list --cursor <cursor_token>
  ```

##### `imgix assets inspect <path>`
* **Arguments**:
  * `<path>` (Required): The relative path of a **specific image file** (e.g. `/images/banner.jpg`).
* **Options**:
  * `-a, --api` (Optional): Bypasses the prompt to inspect the file using administrative Management API records.
* **Detailed Flow**:
  By default, the CLI prompts you to choose how you want to inspect the asset:
  1. **Public Render Properties (via `fm=json`)**:
     * Queries the public CDN rendering URL (e.g. `https://your-domain.imgix.net/path/to/image.jpg?fm=json`), signing it automatically if a Secure URL Token is configured.
     * Retrieves processed rendering metadata including image dimensions, colors, compression formats, and EXIF parameters.
     * **Why it fails with HTTP 404**: This request will fail with an HTTP 404 error if the path does not point to an existing image file (e.g., if you request a directory like `/brands` or if you mistakenly include the Source name in the path like `/goxstream/logo.png`).
  2. **Management API Record**:
     * Queries the administrative imgix Management API for backend storage parameters, original file size, and creation timestamps.
     * Use the `-a` or `--api` flag to skip the prompt and retrieve this data directly.

---

#### `url` — URL Management & Optimization

Analyze or generate signed URLs for secure deployments.

##### `imgix url sign <path> [params]`
* **Arguments**:
  * `<path>` (Required): The relative image path to sign (e.g. `/images/photo.png`).
  * `[params]` (Optional): Query parameters to apply to the image before signing (e.g. `w=800&fit=crop` or `?w=800`).
* **Behavior**: If arguments are omitted, the CLI guides you through text prompts.
* **Output**: Resolves the Secure URL Token for your active Source and generates a secure MD5 signature (appended as the `s` query parameter) for all domains mapped to the Source. This prevents users from altering parameters to fetch unauthorized image crops or sizes.

##### `imgix url optimize <url>`
* **Arguments**:
  * `<url>` (Required): A fully qualified, absolute imgix image URL (e.g. `https://example.imgix.net/photo.jpg?w=500`).
* **Behavior**: If the argument is omitted, you are prompted to input the URL.
* **Analysis**: Compares the URL against performance best practices:
  * Checks if automatic formatting and compression (`auto=format,compress`) are enabled.
  * Checks if Client Hints (`ch=Width,DPR`) are configured to support responsive page layouts.
  * Warns you if the URL is signed (modifying parameters will break the signature).
* **Output**: Displays specific improvement recommendations and provides the fully optimized URL ready to copy.

---

#### `diagnose <url>` — CDN Cache Diagnostics

Verify caching and server headers for any deployed image.

##### `imgix diagnose <url>`
* **Arguments**:
  * `<url>` (Required): The absolute URL of the image to analyze.
* **Behavior**: Performs an HTTP request to inspect headers returned by the CDN edge.
* **Output**: Prints a detailed report containing:
  * **HTTP Status**: Connection health.
  * **Server & Content-Type**: Verification that the CDN is serving the resource.
  * **Encoding**: Verifies if gzip/brotli compression is active.
  * **CDN Cache Diagnostics**: Inspects Fastly caching headers (`X-Cache`, `Cache Hits`, `X-Served-By`) and Cloudflare caching headers (`CF-Cache-Status`) to verify if the asset is served from cache.
  * **Recommendations**: Detailed recommendations if the image suffers from missing cache headers, cache misses, or lack of Gzip/Brotli compression.

---

#### `usage status` — Account Billing & Resource Consumption

Display recent usage details for your imgix subscription.

##### `imgix usage status`
* **Description**: Queries the billing endpoint of the imgix Management API.
* **Output**: Displays the latest 5 generated credit consumption and resource usage reports.
* **Troubleshooting**: If this command returns an **HTTP 403 Forbidden** error, verify that your API key is configured with the `Billing` read scope in your imgix dashboard.

---

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
