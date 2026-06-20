# Implementation Plan: Bulk Purging imgix Assets using Node.js & TypeScript

This plan outlines the design and implementation of a Node.js + TypeScript CLI script to automatically fetch all assets from an imgix Source and purge them in a rate-limited manner.

## Tech Stack Recommendation

We recommend using **Node.js + TypeScript** (executed via `tsx` for zero-compile runtimes) because:
1. The workspace has already been initialized with `pnpm init` and a `package.json`.
2. TypeScript provides strong type safety when mapping the imgix Management API JSON responses.
3. Node.js has robust async flow control, which is essential to throttle requests within imgix's **4 requests per second** rate limit.

---

## User Review Required

> [!IMPORTANT]
> - **API Key Permissions**: You must ensure your API key (currently placed in `.env.local`) has both `Asset Manager Browse` and `Purge` permissions.
> - **Source ID Requirement**: You will need to obtain your **Source ID** from the imgix dashboard and add it to `.env.local` as `IMGIX_SOURCE_ID`.
> - **Data Loss Warning**: This script will purge the cache for all images registered under this Source. Since your origin Cloudflare R2 bucket is already deleted, the purged images will return a permanent 404 error and cannot be recovered unless re-uploaded to a new origin.

---

## Open Questions

> [!NOTE]
> 1. Do you prefer a dry-run mode that lists all assets to be purged before executing the actual purge request?
> 2. Are there any specific folder paths or file extensions you wish to exclude from the purge process, or do you want to purge everything under the Source?

---

## Proposed Changes

### Configuration and Dependencies

#### [MODIFY] [package.json](../../package.json)
- Add required devDependencies: `typescript`, `@types/node`, `tsx`, `dotenv`.
- Add a script entry: `"purge": "tsx src/purge.ts"`.

#### [NEW] [tsconfig.json](../../tsconfig.json)
- Setup basic TypeScript configuration suitable for Node.js ES Modules.

#### [MODIFY] [.env.example](../../.env.example)
- Update to include `IMGIX_SOURCE_ID`.

---

### Core Implementation

#### [NEW] [purge.ts](../../src/purge.ts)
- Implement a script that:
  - Loads environment variables from `.env.local`.
  - Validates the presence of `IMGIX_API_KEY` and `IMGIX_SOURCE_ID`.
  - Implements pagination using `GET https://api.imgix.com/api/v1/sources/:source_id/assets?page[number]=N&page[size]=100`.
  - Throttles the requests to a maximum of 3 requests per second to avoid `429 Too Many Requests` errors.
  - Sends a `POST https://api.imgix.com/api/v1/purge` for each asset.
  - Prints clear status logs to the console showing progress.

---

## Verification Plan

### Automated Tests
- Running the script with a dry-run option to log the actions without invoking the POST API.

### Manual Verification
- Testing with a single mock asset first before running on all assets.
- Checking the HTTP response codes (200 OK for successful purges, 429 for rate-limit issues).
