# Implementation Plan 04: Git Configuration and Staged Commit

This plan outlines the steps to configure `.gitignore` (crucial to protect sensitive credentials like `.env.local` and prevent committing `node_modules`), stage the project files, and create the initial commit.

## Security & Verification Audit

> [!CAUTION]
> - **Credential Leak Warning**: Currently, `.gitignore` is completely empty. If we proceed without configuration, your private `.env.local` containing the `IMGIX_API_KEY` will be committed and exposed to Git history.
> - **Action Required**: We must write a standard `.gitignore` template first before running any Git add/commit actions.

---

## User Review Required

> [!IMPORTANT]
> - **Git Configuration**: The commit will use your local configured Git author. If Git is not globally configured, the commit command might ask for your email/username.
> - **Commit Message**: We propose the commit message `feat: implement modular rate-limited imgix bulk purge tool`.

---

## Proposed Changes

### Git Configuration

#### [MODIFY] [.gitignore](../../.gitignore)
- Add entries for:
  - `node_modules/`
  - `.env`
  - `.env.local`
  - `.env.*.local`
  - `dist/`

---

## Verification Plan

### Automated Run
- Running `git status` after modifying `.gitignore` to verify that `.env.local` and `node_modules` are successfully ignored and not tracked.
- Staging the files: `git add .`
- Creating the commit: `git commit -m "feat: implement modular rate-limited imgix bulk purge tool"`
