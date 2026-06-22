import pc from 'picocolors';
import { config, validateConfig } from '@/pkg/config.js';
import { delay, normalizePath } from '@/internal/utils/helper.js';
import { fetchAssetsPage, submitPurgeRequest, API_ENDPOINTS } from '@/pkg/api/index.js';
import { resolveTargetSources } from '@/internal/wizards/source-resolver.js';
import { ui } from '@/internal/ui/prompts.js';


export async function runPurge() {
  await validateConfig();
  
  ui.intro('imgix Purge Tool');
  
  const selectedSources = await resolveTargetSources(config.apiKey);
  
  const purgeMode = await ui.select({
    message: 'Select Purge Mode:',
    options: [
      { value: 'bulk', label: 'Bulk Purge (Purge all assets inside the Source cache)' },
      { value: 'selective', label: 'Selective Purge (Purge specific file paths)' }
    ]
  });
  
  if (ui.isCancel(purgeMode)) {
    ui.cancel('Purge cancelled.');
    process.exit(0);
  }
  
  let targetPaths: string[] = [];
  
  if (purgeMode === 'selective') {
    const pathsInput = await ui.text({
      message: 'Enter asset paths to purge (comma-separated, e.g. /images/logo.png, icon.svg):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'At least one path is required.';
      }
    });
    
    if (ui.isCancel(pathsInput)) {
      ui.cancel('Purge cancelled.');
      process.exit(0);
    }
    
    targetPaths = (pathsInput as string).split(',').map(p => normalizePath(p.trim())).filter(Boolean);
  }
  
  const proceed = await ui.confirm({
    message: `Are you sure you want to execute purge for ${selectedSources.length} Source(s)?`,
    initialValue: true
  });
  
  if (ui.isCancel(proceed) || !proceed) {
    ui.cancel('Purge execution cancelled.');
    process.exit(0);
  }
  
  for (const src of selectedSources) {
    ui.log.step(`Processing Source: ${pc.cyan(src.name)} (${src.id})`);
    
    let urlsToPurge: string[] = [];
    
    if (purgeMode === 'selective') {
      for (const domain of src.domains) {
        for (const path of targetPaths) {
          urlsToPurge.push(`https://${domain}${path}`);
        }
      }
    } else {
      if (src.id === 'manual') {
        ui.log.error('Cannot run Bulk Purge on a manually configured target. Please use Selective Purge instead.');
        continue;
      }
      
      const s = ui.spinner();
      s.start('Fetching asset list from Source...');
      
      try {
        let nextUrl: string | null = API_ENDPOINTS.sources.assets(src.id, 100);
        let pageCount = 1;
        
        while (nextUrl) {
          s.message(`Fetching asset list page ${pageCount}...`);
          const pageData = await fetchAssetsPage(config.apiKey, nextUrl);
          const assets = pageData.data || [];
          
          for (const asset of assets) {
            let originPath = asset.attributes?.origin_path || '';
            if (!originPath && asset.id.includes('/')) {
              originPath = asset.id.substring(asset.id.indexOf('/') + 1);
            }
            if (originPath) {
              const cleanPath = normalizePath(originPath);
              for (const domain of src.domains) {
                urlsToPurge.push(`https://${domain}${cleanPath}`);
              }
            }
          }
          nextUrl = pageData.links?.next || null;
          pageCount++;
          await delay(250);
        }
        s.stop(`Retrieved ${urlsToPurge.length} URLs to purge`);
      } catch (err: any) {
        s.stop('Failed to fetch asset list');
        ui.log.error(`Error listing assets for Source ${src.name}: ${err.message}`);
        continue;
      }
    }
    
    if (urlsToPurge.length === 0) {
      ui.log.info(`No URLs resolved for Source ${src.name}. Skipping.`);
      continue;
    }
    
    if (config.dryRun) {
      ui.log.info(`[ Dry-run Mode ] URLs that would be purged for Source ${src.name}:`);
      urlsToPurge.forEach((url, i) => {
        ui.log.message(`  [${i + 1}] ${url}`);
      });
    } else {
      const sPurge = ui.spinner();
      sPurge.start(`Purging ${urlsToPurge.length} URLs (3 req/sec)...`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < urlsToPurge.length; i++) {
        const url = urlsToPurge[i];
        sPurge.message(`[${i + 1}/${urlsToPurge.length}] Purging: ${url}...`);
        
        const success = await submitPurgeRequest(config.apiKey, url);
        if (success) successCount++;
        else failCount++;
        
        await delay(350);
      }
      
      sPurge.stop(`Purge complete for ${src.name}`);
      ui.log.success(`Queued successfully: ${successCount}, Failed: ${failCount}`);
    }
  }
  
  ui.outro('Purge operation finished.');
}
