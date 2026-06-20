# Implementation Plan 15: Package Renaming to imgix-cli-unofficial and CLI Command to imgix

This plan aims to publish this package to the npm registry with the name `imgix-cli-unofficial` and change the terminal command call to `imgix` (from the previous `imgix-purge`). Additionally, all GitHub repository links will be updated to `imgix-cli-unofficial`.

## User Review Required

> [!IMPORTANT]
> - **CLI Command Invocation Change**: The terminal command name that was previously `imgix-purge` will change to `imgix` entirely.
> - **Executable File Name**: The wrapper file in `bin/imgix-purge.js` will be renamed to `bin/imgix.js`.
> - **Global Credentials Storage**: The name of the global credential storage file on the user's OS will be changed from `~/.imgix-purge-auth.json` to `~/.imgix-auth.json`.

---

## Proposed Changes

### Configuration and Build Settings

#### [MODIFY] [package.json](../../../package.json)
- Change the `"name"` property from `"imgix-purge"` to `"imgix-cli-unofficial"`.
- Update the `"bin"` object to map the `"imgix"` command to the file `"./bin/imgix.js"`.
- Rename the script `"imgix-purge"` to `"imgix"` and adjust its execution target to `node bin/imgix.js`.
- Update the script `"unlink:local"` from `imgix-purge` to `imgix`.
- Update repository, bug tracker, and homepage URLs to point to `https://github.com/dyzulk/imgix-cli-unofficial`.
- Adjust the self-reference local dependency `"imgix-purge": "link:"` to `"imgix-cli-unofficial": "link:"`.

#### [DELETE] [bin/imgix-purge.js](../../../bin/imgix-purge.js)
- Remove the old wrapper executable file.

#### [NEW] [bin/imgix.js](../../../bin/imgix.js)
- Create a new wrapper executable file named `bin/imgix.js` containing a shebang pointing to `./dist/index.js`.

---

### Core Source Changes

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Change the `program.name('imgix-purge')` invocation to `program.name('imgix')`.
- Update the CLI application description to reflect the escalation to a general imgix companion tool.
- Update Commander output help replacements from `Usage: imgix-purge` to `Usage: imgix`.

#### [MODIFY] [src/auth.ts](../../../src/auth.ts)
- Change the global credential file storage path `AUTH_FILE_PATH` to `.imgix-auth.json`.

---

### Test Suite Changes

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- Update all E2E test execution instances from `node ./bin/imgix-purge.js` to `node ./bin/imgix.js`.
- Adjust help text assertions to match `Usage: imgix` instead of `Usage: imgix-purge`.

---

## Verification Plan

### Automated Tests
- Run TypeScript type checking: `pnpm run types:check`
- Run the build process: `pnpm run build`
- Run E2E tests to validate CLI invocation changes: `pnpm run test:e2e`

### Manual Verification
- Run local linking with `pnpm link --global` to verify global `imgix` alias registration.
- Run `imgix --help` to confirm help output with the new CLI command name.
- Run `imgix auth status` to verify credentials fallback resolution.
