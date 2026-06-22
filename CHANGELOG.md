# Changelog

All notable changes to this project will be documented in this file.

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
