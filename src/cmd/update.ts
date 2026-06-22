import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import pc from 'picocolors';
import { ui } from '../internal/ui/prompts.js';

export function getInstallationSource(): 'npm' | 'yarn' | 'pnpm' | 'git-clone' | 'unknown' {
  const currentFilePath = fileURLToPath(import.meta.url);
  const normalizedPath = currentFilePath.replace(/\\/g, '/');

  const isInsideNodeModules = normalizedPath.includes('/node_modules/');

  if (!isInsideNodeModules) {
    return 'git-clone';
  }

  // 1. Check NPM root dynamically
  try {
    const npmRoot = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/\\/g, '/');
    if (npmRoot && normalizedPath.toLowerCase().includes(npmRoot.toLowerCase())) {
      return 'npm';
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Check PNPM root dynamically
  try {
    const pnpmRoot = execSync('pnpm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/\\/g, '/');
    if (pnpmRoot && normalizedPath.toLowerCase().includes(pnpmRoot.toLowerCase())) {
      return 'pnpm';
    }
  } catch (e) {
    // Ignore error
  }

  // 3. Check Yarn root dynamically
  try {
    const yarnRoot = execSync('yarn global dir', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/\\/g, '/');
    if (yarnRoot && normalizedPath.toLowerCase().includes(yarnRoot.toLowerCase())) {
      return 'yarn';
    }
  } catch (e) {
    // Ignore error
  }

  // 4. Static fallbacks in case dynamic check fails or command is not found
  const lowerPath = normalizedPath.toLowerCase();
  if (lowerPath.includes('/pnpm/global/') || lowerPath.includes('/.local/share/pnpm/')) {
    return 'pnpm';
  }

  if (lowerPath.includes('/yarn/data/global/') || lowerPath.includes('/.config/yarn/global/')) {
    return 'yarn';
  }

  if (
    lowerPath.includes('/appdata/roaming/npm/') || 
    lowerPath.includes('/usr/local/lib/node_modules/') ||
    lowerPath.includes('/.npm-global/')
  ) {
    return 'npm';
  }

  return 'unknown';
}

function isNewerVersion(local: string, remote: string): boolean {
  const localParts = local.split('.').map(Number);
  const remoteParts = remote.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const l = localParts[i] || 0;
    const r = remoteParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

export async function runSelfUpdate(currentVersion: string) {
  ui.intro('imgix CLI Self-Update');

  const s = ui.spinner();
  s.start('Checking for updates...');

  let latestVersion = '';
  try {
    const res = await fetch('https://registry.npmjs.org/imgix-cli-unofficial/latest');
    if (!res.ok) {
      throw new Error(`Registry responded with status ${res.status}`);
    }
    const data = (await res.json()) as { version: string };
    latestVersion = data.version;
    s.stop('Finished version check');
  } catch (error: any) {
    s.stop('Failed to check for updates');
    ui.log.error(`Could not reach the npm registry: ${error.message || error}`);
    process.exit(1);
  }

  if (!isNewerVersion(currentVersion, latestVersion)) {
    ui.log.success(`You are already running the latest version (v${currentVersion}).`);
    ui.outro('No update required.');
    return;
  }

  ui.log.info(`A new version is available: v${currentVersion} -> v${latestVersion}`);

  const source = getInstallationSource();

  if (source === 'git-clone') {
    ui.log.warn('CLI is running from a local git clone or development link.');
    ui.log.info('To update, please pull the latest changes and rebuild:');
    ui.log.message(`  git pull\n  pnpm install\n  pnpm build`);
    ui.outro('Self-update skipped for development mode.');
    return;
  }

  if (source === 'unknown') {
    ui.log.warn('Could not determine global installation package manager.');
    ui.log.info('You can update manually using one of the following commands:');
    ui.log.message(
      `  npm install -g imgix-cli-unofficial\n` +
      `  pnpm add -g imgix-cli-unofficial\n` +
      `  yarn global add imgix-cli-unofficial`
    );
    ui.outro('Self-update skipped.');
    return;
  }

  const confirm = await ui.confirm({
    message: `Do you want to update to v${latestVersion}?`,
  });

  if (ui.isCancel(confirm) || !confirm) {
    ui.cancel('Update cancelled.');
    return;
  }

  let updateCmd = '';
  if (source === 'pnpm') {
    updateCmd = 'pnpm add -g imgix-cli-unofficial';
  } else if (source === 'yarn') {
    updateCmd = 'yarn global add imgix-cli-unofficial';
  } else {
    updateCmd = 'npm install -g imgix-cli-unofficial';
  }

  const updateSpinner = ui.spinner();
  updateSpinner.start(`Updating CLI via ${source}...`);

  try {
    execSync(updateCmd, { stdio: 'inherit' });
    updateSpinner.stop('Update completed successfully!');
    ui.log.success(`imgix-cli has been updated to v${latestVersion}.`);
    ui.outro('Done.');
  } catch (error: any) {
    updateSpinner.stop('Update failed');
    ui.log.error(`Failed to execute: ${updateCmd}`);
    ui.log.error(error.message || error);
    ui.log.info('Please run the update command manually, prefixing with sudo if necessary.');
    process.exit(1);
  }
}
