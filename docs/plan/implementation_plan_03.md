# Implementation Plan 03: CLI Behavior Adjustment and Help Menu Implementation

This plan adjusts the default execution behavior of the CLI tool and adds a comprehensive help menu to improve user experience.

## Audited CLI Behavior and Recommendations

Based on your feedback, we analyzed the CLI design:
1. **Default to Execution**: It is common for command-line tools to execute their primary command by default when run. To prevent accidental bulk deletion in production, we will print a prominent start confirmation log, but proceed with the execution immediately.
2. **Dry-Run Flag**: We will introduce a `--dry-run` (or `-d`) flag to allow you to simulate the operation and see the asset list without performing any HTTP POST purge requests.
3. **Help Menu**: We will capture `--help` (or `-h`) flags to display a user-friendly CLI guide and exit immediately without validation errors or requests.

---

## User Review Required

> [!WARNING]
> - **Execution Danger**: Running `pnpm purge` without any flags will now perform the actual purge requests. Since your origin Cloudflare R2 bucket is already deleted, this will make the purged images permanently return a 404 error. Please run with `--dry-run` or `-d` first to verify the list of images.

---

## Proposed Changes

### CLI & Configuration

#### [MODIFY] [config.ts](../../src/config.ts)
- Modify the arguments parser to:
  - Check for `-h` or `--help` flag.
  - Check for `-d` or `--dry-run` flag.
  - Set `dryRun = true` only when the flag is present; otherwise `dryRun = false` (default to execution mode).
- Implement a `showHelp()` function that prints usage guidelines, available options, and required environment variables, and exits.

---

### Core Execution Flow

#### [MODIFY] [purge.ts](../../src/purge.ts)
- Call `showHelp()` immediately if the help flag is detected, before performing environment validation.

---

## Verification Plan

### Automated Run
- Running `pnpm purge --help` to confirm the help menu displays correctly and the script exits with code 0.
- Running `pnpm purge --dry-run` to confirm the simulation mode operates properly.

### Manual Verification
- Reviewing the updated log warning messages at the start of execution.
