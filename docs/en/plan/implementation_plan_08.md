# Goal Description

Plan 08 aims to make `imgix-purge` behave like a standard global CLI tool by removing the dependency on the `.env.local` file. When the CLI is installed globally by others, forcing them to create a `.env.local` file in their current directory is very unorthodox and can produce annoying logs (such as `◇ injected env`).

## User Review Required

> [!NOTE]
> - Instead, this CLI will accept standard Environment Variables (`IMGIX_API_KEY` and `IMGIX_SOURCE_ID`) directly from the user's shell/system.
> - The CLI will also support direct parameter flags such as `--api-key <key>` and `--source-id <id>`, which is a best practice for CLI tools. Do you agree with removing the `dotenv` library entirely?

## Proposed Changes

### 1. Remove `dotenv` Dependency
Remove the forced loading of `.env.local` so the CLI does not display confusing dotenv injection logs to end-users.

#### [MODIFY] [package.json](../../../package.json)
- Remove the `dotenv` dependency from the `dependencies` block.

### 2. Update Entry Point (Commander)
Add new flags to the Commander framework so users can input credentials directly when invoking the command.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
Add flag definitions:
- `.option('--api-key <key>', 'Your imgix Management API Key (overrides IMGIX_API_KEY env)')`
- `.option('--source-id <id>', 'Your imgix Source ID (overrides IMGIX_SOURCE_ID env)')`
- Pass the arguments parsed by Commander to override the `config` values before executing `runPurge()`.

### 3. Update Configuration Management & Error Messages
Modify `config.ts` so it no longer imports `dotenv` and update the error messages/guides to make more sense for public users.

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Remove the `dotenv` import line.
- Change the `validateConfig()` function so the error message reads: `Error: Missing API Key or Source ID. Please provide them via --api-key and --source-id flags, or by setting the IMGIX_API_KEY and IMGIX_SOURCE_ID environment variables.`
- Change the output of the `showHelp()` function so it no longer mentions the `.env.local` file.

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- Adjust the tests (specifically error checking) to match the new error messages.

## Verification Plan

### Automated Tests
- Run the test command `pnpm run test:e2e` to ensure the new version's responses are not broken.
- The test should fail elegantly (`Error: Missing API Key...`) if flags/env are not provided, instead of failing because `.env.local` is missing.

### Manual Verification
- Run the build with `pnpm run build`.
- Run `pnpm imgix-purge` without the `.env.local` file to ensure the CLI rejects execution with a clear help message, instead of crashing or showing `injected env` text.
