# Changelog

All notable changes to this project will be documented in this file.

## [1.1.6] - 2026-06-22

### Added
- Configured dependency bundling using `tsup`'s `noExternal` setting to pack all external runtime dependencies (`@aws-sdk/client-s3`, `@clack/prompts`, `commander`, `picocolors`) directly into the distributed build. This removes all runtime dependencies from `package.json`, preventing registry conflicts and 404 errors when installing via GitHub Packages using the `--registry` flag.
- Added troubleshooting guidelines in `README.md` for CLI configuration command formatting and Windows/PowerShell quoting requirements.

### Changed
- Moved all runtime dependencies to `devDependencies` in `package.json`.

## [1.1.4] - 2026-06-22

### Added
- Integrated automated dual-registry package publishing to both npmjs.org and GitHub Packages (under the `@dyzulk` scope) within the CI/CD release workflow.
- Updated README.md with complete documentation for GitHub Packages installation, scoped configuration, and registry switching guidelines.

### Changed
- Refactored the `update` (self-update) command to dynamically check the installation path for the `@dyzulk` scope, automatically applying the correct package name and registry flags when checking for or performing updates.
- Cleaned up one-off manual migration scripts (`publish-github-packages.ts`) and workflows (`publish-github-packages.yml`).

## [1.1.3] - 2026-06-22

### Changed
- Centralized all global URLs and API endpoints in a new global constants file (`constants.ts`) and `API_ENDPOINTS` object.
- Replaced relative path imports (both sibling `./` and parent `../`) with mapped path aliases (`@/`) across the entire codebase.
- Deleted the deprecated barrel file `src/cmd/index.ts` to make command imports in `src/bin/commands/` consistent and direct.

## [1.1.2] - 2026-06-22

### Changed
- Refactored `imgix assets sync` command, decomposing the monolithic implementation into modular files under `src/cmd/assets/sync/` (`config.ts`, `compare.ts`, `executor.ts`).

## [1.1.1] - 2026-06-22

### Changed
- Refactored `src/bin/imgix.ts` to delegate subcommand registrations into separate modular files under `src/bin/commands/`.
- Deconstructed the `src/internal/wizards/source-resolver.ts` wizard into focused sub-modules (`manual.ts`, `select.ts`, `fetch.ts`) under `src/internal/wizards/source/`.

## [1.1.0] - 2026-06-22

### Added
- Added new `imgix assets sync` subcommand to scan an origin storage bucket (Cloudflare R2 or AWS S3) and index assets into the imgix Asset Manager.
- Added interactive options menu (sync all, sync new only, filter by sub-prefix, dry-run) to manage sync execution after counting the scanned bucket assets.
- Added support for AWS/R2 credentials lookup from environment variables (`AWS_SECRET_ACCESS_KEY` or `R2_SECRET_ACCESS_KEY`) and secure interactive password prompt fallback.
- Added `@aws-sdk/client-s3` dependency for secure bucket interaction.

### Changed
- Refactored monolithic codebase architecture to isolate concerns: decomposed API wrappers into sub-modules under `src/pkg/api/`, separated S3 interactions into a storage service layer, and split assets commands into individual files under `src/cmd/assets/`.

## [1.0.9] - 2026-06-22

### Changed
- Configured self-update command to force install the exact latest version (e.g. `imgix-cli-unofficial@1.0.9`) to bypass npm registry cache and index propagation lag.

## [1.0.8] - 2026-06-22

### Changed
- Formatted `imgix assets list` output to show full absolute URLs (using the Source's resolved domain/hostname) instead of relative paths.

## [1.0.7] - 2026-06-22

### Fixed
- Fixed package manager detection failure under Windows junction/symlink paths (such as `nvm-windows` directories) by resolving all paths to their real physical directories using `fs.realpathSync()`.

## [1.0.6] - 2026-06-22

### Changed
- Added pre-validation for target URLs in both `url optimize` and `diagnose` commands.
- Improved error messages for invalid or relative URL paths to clearly explain that a full absolute URL containing the protocol and hostname is required.

## [1.0.5] - 2026-06-22

### Changed
- Improved package manager detection to dynamically resolve global roots (npm, yarn, pnpm) on Windows and Unix systems. This ensures universal compatibility across all node version managers (nvm, nvm-windows, fnm, volta, asdf) and custom system configs.
- Made package manager path checking case-insensitive to fix path resolution issues on Windows.

## [1.0.4] - 2026-06-22

### Added
- Added documentation for the new `update` and `self-update` commands in the README.md features list and command reference table.

## [1.0.3] - 2026-06-22

### Added
- Added new `update` / `self-update` commands to allow users to verify and perform CLI updates directly from the terminal.
- Added automatic detection of the global package manager (`npm`, `yarn`, or `pnpm`) based on the execution path to run the correct update command.
- Added warning and step-by-step instructions for development environments (git clone) or unknown package managers.

## [1.0.2] - 2026-06-21

### Added
- Added metadata status badges (NPM version, monthly downloads, CI build status, license) and tech stack badges (TypeScript, Node.js, pnpm, imgix, GitHub Actions) to the README.md documentation.

## [1.0.1] - 2026-06-21

### Changed
- Configured dynamic version injection at compile time using `tsup` and `define` to avoid hardcoded version strings.

## [1.0.0] - 2026-06-20

### Added
- Initial release of the unofficial imgix CLI tool.
- Global authentication configuration and credentials checking (`auth setup`, `status`, `clear`).
- CDN cache purging for individual URLs and bulk paths (`purge`).
- Explore Sources associated with the account (`source list`, `info`).
- View and inspect assets in a Source (`assets list`, `inspect`).
- Sign and optimize imgix URLs locally (`url sign`, `optimize`).
- Diagnose CDN caching and compression configurations (`diagnose`).
- Fetch bandwidth and resource usage summaries (`usage status`).
