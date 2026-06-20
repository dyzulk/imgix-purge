# Goal Description

Plan 11 aims to improve and complete the information displayed by `imgix-purge --help`. Currently, important options (such as `--api-key`) are hidden because they were set as options specific to the `purge` sub-command, and information regarding *Environment Variables* is missing because Commander's built-in system overrides our old manual *help* implementation.

This plan will reconstruct the *help* menu to make it clean, professional, and globally informative.

## User Review Required

> [!NOTE]
> Once this plan is applied, your `imgix-purge --help` screen will automatically include:
> 1. A list of **Global Options** (including `--api-key` and `--source-id`).
> 2. A detailed explanation of **Environment Variables** at the bottom.
> 
> The manual `showHelp` function from the old code will be completely removed since *Commander* has a much more advanced *auto-generator*. Do you agree?

## Proposed Changes

### 1. Elevating Global Options to the Root Command
Options that apply globally will be moved up to the root command (no longer hidden under the `purge` command) so that they are immediately visible when the user runs `imgix-purge --help`.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Move `.option('--api-key <key>', ...)` and `.option('--source-id <id>', ...)` to the `program` object configuration (before `.command('purge')`).
- Add `.addHelpText('after', ...)` block to the `program` object to append the *Environment Variables* guide (explaining `IMGIX_API_KEY` and `IMGIX_SOURCE_ID`) at the bottom of the *help menu*.
- Retrieve values using `program.opts()` inside the `purge` action to resolve options in the `config` object.

### 2. Removing Redundant Manual Help Logic
Since Commander will handle printing the *help menu* entirely, the old manual *parser* logic in `config.ts` is no longer needed.

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Remove the exported `showHelp()` function.
- Remove the `help` boolean check from the interface and argument parser (as the `-h`/`--help` flag is intercepted directly by Commander before reaching our logic).

## Verification Plan

### Automated Tests
- Run all E2E tests again to ensure the `--help` tests capture the new menu format correctly.

### Manual Verification
- You will be asked to run `imgix-purge --help` in your terminal.
- The output should display the `--api-key` option under **Options**, and clearly list the custom **Environment Variables** section at the end of the text without requiring any subcommands.
