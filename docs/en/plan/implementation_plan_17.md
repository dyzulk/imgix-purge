# Implementation Plan 17: Selective Purging, File-Based Purging, and Stdin Piping

This plan details the implementation of selective caching purge capabilities, file-based purging inputs, and standard input (stdin) piping support inside the `imgix purge` command.

## User Review Required

> [IMPORTANT]
> - **Purge Command Upgrades**: The `imgix purge` command will be updated from a strict "bulk-purge all" utility to support target arguments `[paths...]` and option flags (`--file`, `--stdin`).
> - **Auto-detection of stdin**: If data is piped to the CLI (e.g., `cat list.txt | imgix purge`), the command will automatically read from standard input if no other arguments are provided, making integration into build pipelines seamless.
> - **Input Normalization**: Input paths starting with `http://` or `https://` will be processed directly, while relative paths (e.g. `/img.jpg` or `img.jpg`) will be automatically prefixed with resolved target domains.

---

## Proposed Changes

### CLI Entrypoint

#### [MODIFY] [imgix.ts](../../../src/bin/imgix.ts)
- Update `purge` command definition to support optional arguments `[paths...]`.
- Add options:
  - `-f, --file <file>`: Read path list from a file.
  - `-s, --stdin`: Read path list from standard input (stdin).
- Update action call to pass arguments and options to `runPurge(paths, options)`.

---

### Command Handlers

#### [MODIFY] [purge.ts](../../../src/cmd/purge.ts)
- Update `runPurge` definition: `export async function runPurge(paths?: string[], options?: { file?: string; stdin?: boolean })`.
- Add standard input reader helper to collect piped data.
- Add file reader helper using `fs.readFileSync` or `fs.promises.readFile`.
- Implement path resolver logic:
  - If paths are provided via CLI arguments, file, or stdin, perform selective purging.
  - If no paths are provided, fallback to the original behavior (fetching all assets from the Source and bulk purging).
  - Normalize paths (ensure leading slashes for relative paths) and build target URLs (relative paths combined with target domains).
- Execute the throttle queue (3 requests per second) for the resolved target URLs.

---

## Verification Plan

### Automated Tests
- Create `e2e/purge_selective.test.ts` to test:
  - `imgix purge /image1.jpg /image2.jpg` (selective argument arguments).
  - `imgix purge --file list.txt` (file parsing input).
  - `echo /image3.jpg | imgix purge --stdin` (stdin piping check).
- Run typecheck and compile build:
  - `pnpm run types:check`
  - `pnpm run build`
- Run test runner:
  - `pnpm run test:e2e`

### Manual Verification
- Execute `imgix purge` on a test repository to verify selective purging.
- Pipe a list of asset paths to `imgix purge` and ensure they are parsed and queued properly.
