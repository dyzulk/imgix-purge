# Goal Description

This plan aims to eliminate absolute paths (or the use of path-resolving functions that result in absolute paths) that are only valid locally on your machine. This includes:
1. Changing the path resolution strategy in `e2e` tests to be universal or use direct relative execution.
2. Fixing markdown hyperlink paths in documentation files (specifically in `docs/plan/`) that were accidentally committed using local IDE URLs (`file:///c:/Users/...`) into standard relative GitHub links so they can be clicked in the web repository.

## Proposed Changes

### 1. Refactor E2E Tests (Path Resolution)
Change `path.resolve(process.cwd(), ...)` to simple relative execution paths in the command line.

#### [MODIFY] [e2e/purge.test.ts](../../../e2e/purge.test.ts)
- **Remove**: `const CLI_PATH = path.resolve(process.cwd(), 'bin', 'imgix-purge.js');`
- **Replace with**: Directly calling `node ./bin/imgix-purge.js` inside the `execAsync()` function.

### 2. Fix Markdown Documentation Links
All `implementation_plan_*.md` files that mistakenly use the local IDE URL format will be replaced with GitHub's relative link format.

#### [MODIFY] docs/plan/implementation_plan_*.md
- Change formats like `[package.json](../../../package.json)` to `[package.json](../../../package.json)`.
- The same applies to all file references (`src/config.ts`, `bin/imgix-purge.js`, `tsup.config.ts`, etc.) across all documents in the `docs/plan` folder.

## Verification Plan

### Automated Tests
- Re-run `pnpm run test:e2e` to ensure the tests still run smoothly with relative path invocations.
- Run a string search for `file:///c:/` across the entire project to ensure it returns `0` results.

### Manual Verification
- Perform a `git diff` verification to ensure only the markdown links and `e2e/purge.test.ts` have changed.
- Perform a `git push` back to the repository.
