# Goal Description

Plan 12 aims to implement a global authentication and credential storage system. Previously, we required users to use *Environment Variables* or CLI Flags. This is less convenient for users who want to install this CLI globally (`npm install -g`). 

By adding an `auth` command with an *interactive wizard* for the *setup* process, users can configure it once, and the CLI will remember their credentials on their operating system.

## Proposed Changes

### 1. Adding New Dependency Modules
We will install the interactive UI package.
- **Install**: `@inquirer/prompts` for interactive forms.

### 2. Creating a Global Credential Management System
We will create a new module for the `auth` command and its storage file management.

#### [NEW] [src/auth.ts](../../../src/auth.ts)
- Function `getGlobalAuth()`: Reads the file `~/.imgix-purge-auth.json`.
- Function `setGlobalAuth()`: Saves/overwrites the file `~/.imgix-purge-auth.json`.
- Function `clearGlobalAuth()`: Deletes the credentials file ("logout").

#### [NEW] [src/cmd/auth.ts](../../../src/cmd/auth.ts)
- Command `auth setup`: Runs an interactive Wizard prompting for "API Key" and "Source ID", then saves them.
- Command `auth status`: Reports the current credentials status (whether configured, where they come from, and displays the end portion of the API Key for verification).
- Command `auth clear`: Requests confirmation and then deletes the saved credentials.

### 3. Updating the Main Configuration
Integrate the Auth file system into the initial startup resolution.

#### [MODIFY] [src/config.ts](../../../src/config.ts)
- Add fallback logic. If `IMGIX_API_KEY` is empty in ENV, read from `getGlobalAuth()`.

### 4. Registering the 'auth' Command in Commander
Modify the application *entry point* to recognize the `auth` command group.

#### [MODIFY] [src/index.ts](../../../src/index.ts)
- Register `auth` as a *Command Group*.
- Add `setup`, `status`, and `clear` as sub-commands under `auth`.

## Verification Plan

### Automated Tests
- Run `pnpm run build` and re-run `test:e2e` with an empty environment.

### Manual Verification
- You will be asked to run `imgix-purge auth setup` and fill in the interactive *wizard*.
- You will be asked to run `imgix-purge auth status` to verify.
- Finally, you will run `imgix-purge purge` and ensure the *purge* runs successfully even if you did not specify the `--api-key` flag or a *.env.local* file!
