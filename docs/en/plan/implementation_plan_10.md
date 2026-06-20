# Goal Description

Plan 10 aims to improve CLI security and align it with industry best practices for CLI tools (such as `git`, `npm`, or `docker`). 

Currently, executing `imgix-purge` without arguments directly triggers the `purge` process (as the default command). While this currently fails if credentials are not configured, if a user has configured the `IMGIX_API_KEY` environment variable globally, their cache could be accidentally purged just because they typed the application name.

This plan will prevent that from happening.

## Proposed Changes

### 1. Removing the 'Default' Behavior of the Purge Command
We will modify the command registration settings in Commander so that `purge` is no longer the default action.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- **Remove**: The `{ isDefault: true }` object from `.command('purge', { isDefault: true })`.
- **Add**: Argument detection logic. If `process.argv` has no arguments other than the program name, automatically force Commander to print the help menu (`program.outputHelp()`).

### 2. Updating End-to-End (E2E) Tests
Because the command invocation behavior has changed, the E2E tests must be updated accordingly.

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- Update the test function that previously invoked `node ./bin/imgix-purge.js` (without additional commands) to specifically call `node ./bin/imgix-purge.js purge` or capture the help output when called without arguments.

## Verification Plan

### Automated Tests
- Run `pnpm run build` and `pnpm run test:e2e` to ensure the newly compiled CLI runs successfully.

### Manual Verification
- You will be asked to run `imgix-purge` in your terminal.
- Expected outcome: **No *Missing API Key* error will be shown**, and the terminal will display the standard help usage text (*Help Menu*).
