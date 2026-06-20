# Goal Description

Plan 09 aims to resolve the "Command Not Found" issue (`imgix-purge: The term 'imgix-purge' is not recognized...`) during development. 

We will set up a mechanism to let you "install" (register) and "uninstall" the `imgix-purge` command globally on your machine without having to publish or upload it to npmjs first. This mechanism uses the built-in *symlink* feature of Node.js / pnpm.

## Proposed Changes

### 1. Adding Utility Scripts
I will add two new script lines inside `package.json` so you do not have to memorize the global pnpm command.

#### [MODIFY] [package.json](../../../package.json)
- Add `"link:local": "pnpm link --global"` 
  (Used to create a shortcut alias from your source code to the global directory of your Windows system).
- Add `"unlink:local": "pnpm rm --global imgix-purge"` 
  (Used to remove the shortcut and clean up the terminal).

## Verification Plan

### Manual Verification
- Once approved, I will add these scripts.
- I will ask you to run `pnpm run link:local` in your terminal.
- After that, you will be able to run the command `imgix-purge --help` in any folder on your computer!
- If you wish to clean it up, simply run `pnpm run unlink:local`.
