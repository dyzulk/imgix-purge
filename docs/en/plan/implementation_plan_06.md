# Implementation Plan 06: Architectural Plan and CLI/SDK Structure Options for imgix-purge

This document explains the chosen architectural structure for the future development of the `imgix-purge` project using the **Single-Repository Modular** pattern (Option 1). It also presents an analysis of the functions of the `e2e`, `bin`, and `cmd` directories found in reference repositories (`render-cli`, `workers-sdk`, `vercel`).

---

## Chosen Architectural Decision

Based on user feedback, this project will adopt **Option 1: Single-Repository Modular**. This pattern was selected for its efficiency in single-utility projects (non-monorepo) without adding unnecessary workspace management complexity.

### Final Project Directory Structure
```
imgix-purge/
├── src/
│   ├── bin/                 # Main CLI execution entry points
│   │   └── imgix-purge.ts
│   ├── pkg/                 # Core logic/SDK that can be exported publicly
│   │   ├── api.ts           # HTTP interactions with the imgix Management API
│   │   └── config.ts        # Configuration parsing and environment variables (.env)
│   └── internal/            # CLI-specific internal logic (not exposed publicly)
│       ├── commands/        # CLI subcommand modules (browse, purge, status)
│       │   ├── browse.ts
│       │   └── purge.ts
│       └── ui/              # Terminal visual output (table render, spinner)
│           └── output.ts
├── bin/                     # Executable scripts mapped to npm "bin"
│   └── imgix-purge.js
├── e2e/                     # End-to-End (E2E) testing for the compiled CLI
│   └── cli.test.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Analysis of `bin`, `cmd`, and `e2e` Directories

Why do large CLI repositories like Wrangler (`workers-sdk`), Vercel, and Render CLI consistently feature these folders? Here is the explanation:

### 1. The `bin/` Directory (Executables / Entrypoint Scripts)
* **Function**: Contains the main execution script files invoked when a user runs the CLI from the terminal.
* **Why it's needed**: 
  - In the Node.js ecosystem, npm requires an entry script with a *shebang* (`#!/usr/bin/env node` on the first line) to be registered under the `"bin"` property in `package.json`.
  - Files inside the `bin/` folder are usually extremely thin. Their sole purpose is to import the compiled main module from the distribution folder (like `dist/` or `wrangler-dist/`) and execute it.
  - This separates OS-level execution files from development source code (`src/`).

### 2. The `cmd/` Directory (Go Command Pattern)
* **Function**: Contains the program entry points for each compilation command (specific to the Go programming language, as seen in `render-cli`).
* **Why it's needed**: 
  - In the Go ecosystem, there is a standard project layout convention. The `cmd/` folder houses the main applications. Each subdirectory inside it (e.g., `cmd/render/`) produces a single executable binary upon compilation (`go build`).
  - For TypeScript/JavaScript projects, the equivalent of `cmd/` is the `src/bin/` or `src/commands/` folder, which separates user command input reading from core logic.

### 3. The `e2e/` Directory (End-to-End Testing)
* **Function**: Used for comprehensive functional testing (End-to-End) on the compiled CLI application.
* **Why it's needed**:
  - **Standard Unit Tests** only test single functions in isolation by mocking API network calls or the filesystem.
  - **E2E Tests** execute actual CLI commands (such as running `node ./bin/imgix-purge.js purge --all`) inside an isolated testing shell environment.
  - These tests verify real interactions with the operating system: whether the `.env` file is read correctly, whether CLI arguments are parsed correctly, how the CLI responds if the API returns a real error, and whether the program exits with the correct exit code (0 for success, 1 for failure).

---

## Proposed Changes

#### [MODIFY] [package.json](../../../package.json)
* Add the `tsup` dependency to compile code from `src` to `dist`.
* Adjust the `"build"`, `"dev"`, and `"bin"` scripts to support execution from the compiled output.

#### [NEW] [tsup.config.ts](../../../tsup.config.ts)
* Create a configuration to build a single ESM JavaScript file from the TypeScript source files.

#### [NEW] [bin/imgix-purge.js](../../../bin/imgix-purge.js)
* Create a wrapper executable file pointing to `./dist/purge.js`.

---

## Verification Plan

### Automated Tests
- Run typescript type checking: `pnpm run types:check`
- Run the build process: `pnpm run build`
- Verify the compiled output files in the `dist/` folder are generated correctly and can be executed directly using Node.js.
