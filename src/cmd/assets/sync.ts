import pc from 'picocolors';
import { resolveSingleTargetSource } from '@/internal/wizards/source-resolver.js';
import { config, validateConfig } from '@/pkg/config.js';
import { ui } from '@/internal/ui/prompts.js';
import { scanBucketObjects } from '@/internal/services/storage.js';
import { resolveBucketConfig } from '@/cmd/assets/sync/config.js';
import { filterNewAssetsOnly } from '@/cmd/assets/sync/compare.js';
import { performAssetIndexing } from '@/cmd/assets/sync/executor.js';


export async function runAssetsSync(options: { prefix?: string }) {
  await validateConfig();
  
  ui.intro('imgix Asset Synchronizer');
  
  const src = await resolveSingleTargetSource(config.apiKey);
  
  if (src.id === 'manual') {
    ui.log.error('Cannot sync assets on a manually configured target.');
    process.exit(1);
  }
  
  const bucketConfig = await resolveBucketConfig(config.apiKey, src.id);
  
  // Combine prefix options: CLI option takes precedence, fallback to source prefix
  const filterPrefix = options.prefix !== undefined ? options.prefix : bucketConfig.sourcePrefix;
  
  ui.log.step(`Scanning bucket: ${pc.cyan(bucketConfig.bucketName)}`);
  if (bucketConfig.endpoint) {
    ui.log.step(`Endpoint: ${pc.dim(bucketConfig.endpoint)}`);
  }
  if (filterPrefix) {
    ui.log.step(`Prefix Filter: ${pc.cyan(filterPrefix)}`);
  }
  
  const sScan = ui.spinner();
  sScan.start('Listing objects in bucket...');
  
  let keys: string[] = [];
  try {
    keys = await scanBucketObjects({
      bucketName: bucketConfig.bucketName,
      accessKeyId: bucketConfig.accessKeyId,
      secretAccessKey: bucketConfig.secretAccessKey,
      endpoint: bucketConfig.endpoint,
      region: bucketConfig.region,
      prefix: filterPrefix || undefined,
    });
    
    sScan.stop(`Scan complete. Found ${keys.length} assets in bucket.`);
  } catch (error: any) {
    sScan.stop('Failed to list objects in bucket');
    ui.log.error(error.message || error);
    process.exit(1);
  }
  
  if (keys.length === 0) {
    ui.log.info('No files found in the bucket matching the prefix filter.');
    ui.outro('Sync complete.');
    return;
  }
  
  // Interactive Options Menu after scan
  const action = await ui.select({
    message: 'Select action to perform:',
    options: [
      { value: 'sync_all', label: `Sync all found assets (${keys.length} items)` },
      { value: 'sync_new', label: 'Sync only new assets (compare with currently indexed assets)' },
      { value: 'sync_filtered', label: 'Sync specific files by sub-prefix filter' },
      { value: 'dry_run', label: 'Dry Run (preview list of files that would be indexed)' },
      { value: 'cancel', label: 'Cancel' }
    ]
  });
  
  if (ui.isCancel(action) || action === 'cancel') {
    ui.cancel('Operation cancelled.');
    process.exit(0);
  }
  
  let keysToSync = [...keys];
  
  if (action === 'sync_new') {
    keysToSync = await filterNewAssetsOnly(config.apiKey, src.id, keys);
    if (keysToSync.length === 0) {
      ui.log.info('All scanned assets are already indexed in imgix.');
      ui.outro('Sync complete.');
      return;
    }
  } else if (action === 'sync_filtered') {
    const subPrefix = await ui.text({
      message: 'Enter sub-prefix to filter scanned assets (e.g. images/products/):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Sub-prefix is required.';
      }
    });
    
    if (ui.isCancel(subPrefix)) {
      ui.cancel('Filtered sync cancelled.');
      process.exit(0);
    }
    
    const cleanSubPrefix = (subPrefix as string).trim();
    keysToSync = keys.filter(k => k.startsWith(cleanSubPrefix));
    
    ui.log.info(`Filtered down to ${keysToSync.length} assets matching prefix: "${cleanSubPrefix}"`);
    if (keysToSync.length === 0) {
      ui.outro('No assets match filter. Sync complete.');
      return;
    }
  } else if (action === 'dry_run') {
    ui.intro('Dry Run - Assets in Bucket:');
    keys.forEach((k, idx) => {
      ui.log.message(`  [${idx + 1}] ${k}`);
    });
    ui.outro(`Dry run complete. ${keys.length} items found.`);
    return;
  }
  
  await performAssetIndexing(config.apiKey, src.id, src.name, keysToSync);
  
  ui.outro('Sync complete.');
}
