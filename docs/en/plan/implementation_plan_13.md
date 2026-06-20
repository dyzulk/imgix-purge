# Goal Description

Plan 13 aims to polish the visual terminal display (CLI UI) to match modern, high-level tools (*Vercel*, *Wrangler*, *create-cloudflare*). The user wants a clean, beautiful interface without system emojis and rigid, old-school text formatting.

We will use the `@clack/prompts` and `picocolors` dependencies, which are the current gold standard in the modern CLI development industry (used by SvelteKit, Cloudflare, etc.).

## Proposed Changes

### 1. Dependency Changes
We will remove the Inquirer dependency and install Clack.
- **Uninstall**: `@inquirer/prompts`
- **Install**: `@clack/prompts` and `picocolors`

### 2. Revamping the Authentication Visuals (Setup)
We will rewrite the wizard functions using the `@clack/prompts` API.

#### [MODIFY] [src/cmd/auth.ts](../../../src/cmd/auth.ts)
- Use `intro('imgix-purge Authentication Setup')` and `outro()` for the setup intro and outro.
- Replace Inquirer's `input()` calls with Clack's `text()`.
- Add cancel validation using `isCancel`.
- Use `picocolors` (e.g., `pc.green('✔')`) to render status icons in the `runAuthStatus` and `runAuthClear` functions.

## Verification Plan

### Manual Verification
- You will be asked to re-run `imgix-purge auth setup` and `imgix-purge auth status`.
- The display will radically change, becoming much more elegant and minimalist like Vercel CLI or Wrangler!
