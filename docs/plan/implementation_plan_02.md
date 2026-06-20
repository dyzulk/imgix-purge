# Implementation Plan 02: Refactoring and Modularizing the imgix Purge Script

This plan outlines the steps to refactor `src/purge.ts` from a single monolithic file into a modular structure by separating concerns (configuration, API interactions, utilities, and execution).

## Proposed Modular Architecture

We will split the codebase into four separate files to ensure high cohesion and low coupling:
1. **`src/config.ts`**: Responsible for loading and validating environment variables (`.env.local`) and parsing CLI arguments.
2. **`src/utils.ts`**: Helper utilities (e.g., rate-limiting delays and URL normalization).
3. **`src/api.ts`**: Encapsulates all interactions with the imgix Management API (fetching source, listing assets, sending purge POST requests).
4. **`src/purge.ts`**: The main orchestrator/CLI entry point that controls the execution flow, loops through pages, and logs progress.

---

## User Review Required

> [!IMPORTANT]
> - **Zero Behavioral Changes**: The refactoring will preserve all existing functionality, including rate-limiting (3 requests per second) and dry-run safety by default.
> - **Execution Method**: You will still run the script using `pnpm purge` (or `pnpm purge --execute`).

---

## Proposed Changes

### Core Refactoring

#### [NEW] [config.ts](../../src/config.ts)
- Define a type-safe configuration interface.
- Implement env loading using `dotenv`.
- Export a read-only configuration object including `apiKey`, `sourceId`, `execute`, and `dryRun`.

#### [NEW] [utils.ts](../../src/utils.ts)
- Implement `delay(ms)` helper for throttle control.
- Implement URL normalization (e.g., prefixing slashes and removing duplicate slashes).

#### [NEW] [api.ts](../../src/api.ts)
- Define response interfaces for JSON:API format.
- Implement `fetchSourceDomains(apiKey, sourceId)` to fetch all subdomains and custom domains.
- Implement `fetchAssetsPage(apiKey, nextUrl)` to retrieve a page of assets.
- Implement `submitPurgeRequest(apiKey, url)` to send a POST purge request.

#### [MODIFY] [purge.ts](../../src/purge.ts)
- Import from `config.ts`, `utils.ts`, and `api.ts`.
- Clean up the main execution script to focus entirely on routing flow, progress reporting, and bulk execution loop.

---

## Verification Plan

### Automated Run
- Running the script in dry-run mode using `pnpm purge` to verify that modular imports work and the script correctly parses the arguments.

### Manual Verification
- Verifying the console logs for correctness and confirming the layout matches the original script outputs.
