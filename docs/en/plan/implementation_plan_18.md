# Implementation Plan 18: Zero-Config CLI Setup & Fully Interactive API Resolution

This plan details the complete removal of all environment variables and targeting CLI flags from the `imgix` CLI tool, establishing a single source of truth (`~/.imgix-auth.json`) and a fully interactive, API-driven command-line experience.

## User Review Required

> [IMPORTANT]
> - **Removal of Env Variables**: All environment variables (`IMGIX_API_KEY`, `IMGIX_SOURCE_ID`, `IMGIX_SECURE_TOKEN`, `IMGIX_DOMAINS`) will be completely removed as configuration sources.
> - **Removal of Targeting Flags**: CLI flags for manual overrides (`--api-key`, `--source-id`, `--secure-token`, `--domain`) will be deleted. The CLI only accepts action parameters (e.g. `inspect <path>`) and system options (`--dry-run`, `--batch-size`).
> - **Auto-Authentication Trigger**: If a command requiring credentials is run and no API key is saved in `~/.imgix-auth.json`, the CLI will dynamically launch the interactive setup wizard to get the key, save it, and proceed with the execution without aborting.
> - **Fully Interactive Resolution**: Sources, domains, and Secure URL Tokens are resolved entirely via the Management API by presenting the interactive checklist dropdown (`multiselect` with select-all/clear-all).

---

## Proposed Changes

### CLI Configurations & Global Auth

#### [MODIFY] [auth.ts](../../../src/pkg/auth.ts)
- Simplify `AuthConfig` to store only `apiKey`.
- Remove any fallback to environment variables.

#### [MODIFY] [config.ts](../../../src/pkg/config.ts)
- Completely strip out parsing of `process.env.IMGIX_API_KEY`, `IMGIX_SOURCE_ID`, `IMGIX_SECURE_TOKEN`, and `IMGIX_DOMAINS`.
- Remove manual override targeting flags (`--api-key`, `--source-id`, `--secure-token`, `--domain`).
- Update `validateConfig` to dynamically trigger the `runAuthSetup` wizard if `apiKey` is not set, then reload the configuration.

---

### Command Handlers & Entrypoint

#### [MODIFY] [imgix.ts](../../../src/bin/imgix.ts)
- Clean up `Command` setup: remove options for `--api-key`, `--source-id`, `--secure-token`, and `--domain`.
- Remove all environment variable documentation from the help text.

#### [MODIFY] [auth.ts](../../../src/cmd/auth.ts)
- Update `runAuthSetup` to prompt only for the Management API Key and save it.
- Update `runAuthStatus` to show only the logged-in status of the API Key.

#### [MODIFY] [purge.ts](../../../src/cmd/purge.ts), [assets.ts](../../../src/cmd/assets.ts), [source.ts](../../../src/cmd/source.ts), [url.ts](../../../src/cmd/url.ts)
- Refactor to resolve all targets (Source IDs, domains, secure signing tokens) dynamically using the interactive checklist prompt, querying the Management API at runtime.

---

## Verification Plan

### Automated Tests
- Update E2E test suites to remove environment variable configuration.
- Assert that running commands without an API key triggers the interactive setup.
- Run typecheck and compile build:
  - `pnpm run types:check`
  - `pnpm run build`
- Run test runner:
  - `pnpm run test:e2e`

### Manual Verification
- Remove any existing `.env` or `.env.local` files and unset environment variables.
- Run `imgix purge` on a clean environment and verify the CLI prompts for the API Key, saves it, and then presents the interactive checklist to select Sources.
