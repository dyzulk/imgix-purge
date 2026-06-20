# CLI Architecture Structure Comparison Analysis

This document provides a comparative analysis between the standard Command Line Interface (CLI) project structures distributed via npmjs (such as Wrangler CLI, Vercel CLI, Render CLI) and direct execution script setups (using `tsx` or `ts-node`), along with recommendations for the `imgix-purge` project.

---

## 1. Project Structure Comparison

In general, modern Node.js-based CLI tools published to the npm registry decouple the development source code from the compiled distribution build.

Here is a comparison of characteristics between the standard industry CLI pattern and the direct script pattern currently used:

| Characteristic | Standard CLI Pattern (Wrangler, Vercel, etc.) | Direct Script Pattern (Current imgix-purge) |
| :--- | :--- | :--- |
| **Source Directory (`src`)** | Yes. Nicely separates CLI logic, utilities, APIs, and tests. | Yes. Used to store TypeScript code. |
| **Distribution Directory (`dist`)** | Yes. Contains compiled/minified JavaScript files (`.js` or `.mjs`). | No. Executes `.ts` files directly at runtime. |
| **Execution Method** | Runs the compiled JavaScript files using Node.js directly. | Runs the TypeScript files using an on-the-fly compiler like `tsx`. |
| **Startup Time (Latency)** | Very Fast (Instant). No compilation overhead when running commands. | Slower. Requires additional time to compile TypeScript to JavaScript on the fly. |
| **User Dependencies** | Low. The user only needs a Node.js runtime to execute it. | High. The user must install compiler tools (like `tsx` or `ts-node`) to execute. |
| **npm Package Size** | Small. Only the compiled output is published (raw `.ts` and tests are ignored). | Larger if all raw TypeScript files and builder utilities are published. |
| **Ease of Renaming** | Very Easy. Just change the `"bin"` mapping in `package.json` pointing to the build. | Relatively Easy, but execution commands and runtimes must be adjusted. |

---

## 2. Why Do Standard CLIs Use the `src` & `dist` Architecture?

There are several key technical reasons why tools like `wrangler` or `vercel` enforce this separation:

### A. Bootstrapping Performance
CLI applications are highly sensitive to startup latency. If a CLI takes more than 200ms just to show the `--help` menu, the user will experience noticeable lag.
- By compiling TypeScript to plain JavaScript in the `dist/` directory before publishing, Node.js can execute the code instantly without any runtime compilation overhead.

### B. User Environment Compatibility
Node.js does not execute `.ts` files natively without experimental flags or third-party compiler libraries.
- If you distribute raw `.ts` source files to end-users via npm, they must install compilation tools as dependencies.
- By publishing compiled standard `.js` files to `dist/`, your CLI is guaranteed to run in any environment where Node.js is installed, without requiring compiler toolchains.

### C. Bundling and Tree-Shaking
Modern bundlers like `tsup`, `esbuild`, or `rollup` can merge third-party dependencies and internal files into a single, optimized JavaScript file. This minimizes the footprint of `node_modules` and speeds up the `npm install` process for CLI users.

---

## 3. Recommendation for the `imgix-purge` Project

Is it recommended for the `imgix-purge` project to adopt this standard structure?

**Yes, it is highly recommended**, especially if you plan to:
1. **Rename the CLI**: For example, changing the command from `imgix-purge` to `ix-purge` or a shorter, more convenient command.
2. **Add New Features**: Such as interactive prompts (using `prompts`), advanced argument parsing (using `commander` or `cac`), and customizable output formats (JSON, tables, etc.).
3. **Publish to npmjs**: To allow other users to install it globally (`npm install -g imgix-purge`) or run it directly via npx (`npx imgix-purge`).

---

## 4. Proposed Migration Plan for `imgix-purge`

If you would like to implement these changes, here is the suggested step-by-step path:

### Step A: Configure Bundler Tooling (Recommended: `tsup`)
`tsup` is an `esbuild`-powered bundler that is fast and requires minimal configuration for Node.js CLIs.

1. Install `tsup` as a development dependency:
   ```bash
   pnpm add -D tsup
   ```

2. Create a `tsup.config.ts` configuration file at the root:
   ```typescript
   import { defineConfig } from "tsup";

   export default defineConfig({
     entry: ["src/purge.ts"],
     format: ["esm"],
     dts: false,
     clean: true,
     minify: true,
     sourcemap: false
   });
   ```

### Step B: Update `package.json`
Update the configuration to point to the build output in the `dist/` folder:

```json
{
  "name": "imgix-purge",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/purge.js",
  "bin": {
    "imgix-purge": "./dist/purge.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "pnpm build",
    "imgix-purge": "node dist/purge.js",
    "dev": "tsx src/purge.ts",
    "types:check": "tsc --noEmit"
  }
}
```

> [!NOTE]
> - The `"bin"` configuration above map the command name `imgix-purge` to the compiled `./dist/purge.js` executable.
> - The `"files": ["dist"]` field ensures that only the `dist` folder (plus mandatory files like `package.json` and `README.md`) is uploaded to npmjs, keeping the package extremely lightweight.

### Step C: Add Shebang to the Main Entrypoint (`src/purge.ts`)
Ensure that the very first line of your main entry point file (`src/purge.ts`) contains the shebang directive so that operating systems know how to execute the file using Node.js:
```typescript
#!/usr/bin/env node

// Your main logic here...
```

With this architecture, your project will be ready for further growth, offering optimized startup performance and standard compatibility within the npmjs ecosystem.
