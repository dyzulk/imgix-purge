import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SCOPE = '@dyzulk';
const ORIGINAL_NAME = 'imgix-cli-unofficial';
const TARGET_NAME = `${SCOPE}/${ORIGINAL_NAME}`;
const REGISTRY = 'https://npm.pkg.github.com/';

// Get the currently active branch to return to at the end of the process
const originalBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

try {
  console.log('Fetching git tags...');
  const tagsText = execSync('git tag -l "v*"', { encoding: 'utf8' });
  const tags = tagsText.split('\n')
    .map(t => t.trim())
    .filter(Boolean)
    .sort((a, b) => {
      const partsA = a.substring(1).split('.').map(Number);
      const partsB = b.substring(1).split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i];
      }
      return 0;
    });

  console.log(`Found ${tags.length} versions in Git history.`);

  for (const tag of tags) {
    const version = tag.substring(1);
    console.log(`\n---------------------------------------`);
    console.log(`Checking version: ${version} (${tag})`);

    let versionExists = false;
    try {
      const checkCmd = `npm view ${TARGET_NAME}@${version} version --registry=${REGISTRY}`;
      const existingVersion = execSync(checkCmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
      if (existingVersion === version) {
        versionExists = true;
      }
    } catch (e) {
      versionExists = false;
    }

    if (versionExists) {
      console.log(`Version ${version} already exists in GitHub Packages. Skipping.`);
      continue;
    }

    console.log(`Version ${version} does not exist. Starting checkout and publish process...`);

    // 1. Checkout to the corresponding tag
    execSync(`git checkout ${tag}`, { stdio: 'inherit' });

    // 2. Dynamically modify package.json for scope and registry configuration
    const pkgPath = path.resolve('package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    pkg.name = TARGET_NAME;
    pkg.publishConfig = {
      registry: REGISTRY
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');

    // 3. Build the project
    console.log(`Building version ${version}...`);
    try {
      execSync('pnpm run build', { stdio: 'inherit' });
    } catch (e) {
      console.log('Build failed with pnpm. Trying npm...');
      execSync('npm run build', { stdio: 'inherit' });
    }

    // 4. Publish to GitHub Packages
    console.log(`Publishing @${version} to GitHub Packages...`);
    execSync(`npm publish --registry=${REGISTRY}`, { stdio: 'inherit' });

    // Discard package.json modifications after successful publication
    execSync('git checkout -- package.json', { stdio: 'inherit' });
  }

  console.log('\n=======================================');
  console.log('Migration process completed successfully!');

} catch (error: any) {
  console.error('An error occurred during the migration process:', error.message);
} finally {
  // Return to the original branch
  console.log(`\nReturning to the original branch: ${originalBranch}`);
  execSync(`git checkout ${originalBranch}`, { stdio: 'inherit' });
}
