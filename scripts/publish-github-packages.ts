import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SCOPE = '@dyzulk';
const ORIGINAL_NAME = 'imgix-cli-unofficial';
const TARGET_NAME = `${SCOPE}/${ORIGINAL_NAME}`;
const REGISTRY = 'https://npm.pkg.github.com/';

// Mendapatkan branch aktif saat ini untuk kembali di akhir proses
const originalBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

try {
  console.log('Mengambil daftar git tags...');
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

  console.log(`Menemukan ${tags.length} versi di Git history.`);

  for (const tag of tags) {
    const version = tag.substring(1);
    console.log(`\n---------------------------------------`);
    console.log(`Memeriksa versi: ${version} (${tag})`);

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
      console.log(`Versi ${version} sudah ada di GitHub Packages. Lewati.`);
      continue;
    }

    console.log(`Versi ${version} belum ada. Memulai proses checkout dan publish...`);

    // 1. Checkout ke Tag terkait
    execSync(`git checkout ${tag}`, { stdio: 'inherit' });

    // 2. Modifikasi package.json secara dinamis untuk scope & registry
    const pkgPath = path.resolve('package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    pkg.name = TARGET_NAME;
    pkg.publishConfig = {
      registry: REGISTRY
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');

    // 3. Build Proyek
    console.log(`Membuat build untuk versi ${version}...`);
    try {
      execSync('pnpm run build', { stdio: 'inherit' });
    } catch (e) {
      console.log('Build failed with pnpm. Trying npm...');
      execSync('npm run build', { stdio: 'inherit' });
    }

    // 4. Publish ke GitHub Packages
    console.log(`Mempublikasikan @${version} ke GitHub Packages...`);
    execSync(`npm publish --registry=${REGISTRY}`, { stdio: 'inherit' });

    // Discard perubahan package.json setelah publish sukses
    execSync('git checkout -- package.json', { stdio: 'inherit' });
  }

  console.log('\n=======================================');
  console.log('Proses migrasi selesai dengan sukses!');

} catch (error: any) {
  console.error('Terjadi kesalahan saat proses migrasi:', error.message);
} finally {
  // Kembali ke branch semula
  console.log(`\nKembali ke branch semula: ${originalBranch}`);
  execSync(`git checkout ${originalBranch}`, { stdio: 'inherit' });
}
