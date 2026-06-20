# Implementation Plan 05: Types Check Script and npmjs Package Metadata Configuration

This plan outlines the steps to populate all standard metadata fields in `package.json` to ensure the package details are fully detailed and compliant with the npmjs registry when published.

## Proposed Changes

### package.json Configuration

#### [MODIFY] [package.json](../../package.json)
- Populate all standard registry metadata fields:
  - `"description"`: `"A CLI tool to bulk purge all assets in an imgix Source cache."`
  - `"keywords"`: `["imgix", "purge", "cache", "cdn", "bulk-purge", "cloudflare-r2"]`
  - `"author"`: `"dyzulk"`
  - `"repository"`:
    ```json
    "repository": {
      "type": "git",
      "url": "git+https://github.com/dyzulk/imgix-purge.git"
    }
    ```
  - `"bugs"`:
    ```json
    "bugs": {
      "url": "https://github.com/dyzulk/imgix-purge/issues"
    }
    ```
  - `"homepage"`: `"https://github.com/dyzulk/imgix-purge#readme"`
  - `"publishConfig"`:
    ```json
    "publishConfig": {
      "registry": "https://registry.npmjs.org/",
      "access": "public"
    }
    ```
- Ensure the `"types:check": "tsc --noEmit"` script is registered.

---

## User Review Required

> [!IMPORTANT]
> - **Git Repository URL**: We have assumed the repository URL format based on your workspace name (`imgix-purge`) and author (`dyzulk`). If you are using a different Git hosting URL or namespace, please update this field.
> - **Commit Message**: We propose the commit message `chore: populate all standard npmjs metadata fields in package.json`.

---

## Verification Plan

### Automated Run
- Verify `git status` after commit to ensure the workspace is clean.
- Stage the modified `package.json`: `git add package.json`
- Create the commit: `git commit -m "chore: populate all standard npmjs metadata fields in package.json"`
