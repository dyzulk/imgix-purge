import pc from 'picocolors';
import { fetchSourceDetail, fetchAssetsPage, addAssetToSource } from '../../pkg/api/index.js';
import { resolveSingleTargetSource } from '../../internal/wizards/source-resolver.js';
import { config, validateConfig } from '../../pkg/config.js';
import { ui } from '../../internal/ui/prompts.js';
import { delay } from '../../internal/utils/helper.js';
import { scanBucketObjects } from '../../internal/services/storage.js';

export async function runAssetsSync(options: { prefix?: string }) {
  await validateConfig();
  
  ui.intro('imgix Asset Synchronizer');
  
  const src = await resolveSingleTargetSource(config.apiKey);
  
  if (src.id === 'manual') {
    ui.log.error('Cannot sync assets on a manually configured target.');
    process.exit(1);
  }
  
  const s = ui.spinner();
  s.start('Fetching Source configuration details...');
  
  let sourceDetail;
  try {
    sourceDetail = await fetchSourceDetail(config.apiKey, src.id);
    s.stop('Source details fetched successfully');
  } catch (error: any) {
    s.stop('Failed to fetch source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
  
  const deployment = sourceDetail.data.attributes.deployment;
  const type = deployment.type;
  
  if (type !== 's3' && type !== 's3_compatible') {
    ui.log.error(`Unsupported source deployment type: ${type}. Only S3 and S3-Compatible (R2) sources are supported for bucket sync.`);
    process.exit(1);
  }
  
  const configObj = deployment[type] || {};
  
  // Extract bucket details
  const bucketName = configObj.s3_bucket || configObj.bucket_name || configObj.bucket;
  const accessKeyId = configObj.s3_access_key || configObj.access_key || configObj.access_key_id;
  const sourcePrefix = configObj.s3_prefix || configObj.prefix || '';
  const endpoint = configObj.endpoint || configObj.s3_endpoint || configObj.s3_compatible_endpoint;
  const region = configObj.region || 'auto';
  
  if (!bucketName) {
    ui.log.error('Bucket name could not be resolved from Source configuration.');
    process.exit(1);
  }
  if (!accessKeyId) {
    ui.log.error('Access Key ID could not be resolved from Source configuration.');
    process.exit(1);
  }
  
  // Resolve secret key
  let secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  if (!secretAccessKey) {
    const inputSecret = await ui.password({
      message: `Enter AWS/R2 Secret Access Key for bucket "${bucketName}" (Access Key ID: ${accessKeyId}):`,
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Secret Access Key is required.';
      }
    });
    
    if (ui.isCancel(inputSecret)) {
      ui.cancel('Sync cancelled.');
      process.exit(0);
    }
    secretAccessKey = (inputSecret as string).trim();
  }
  
  // Combine prefix options: CLI option takes precedence, fallback to source prefix
  const filterPrefix = options.prefix !== undefined ? options.prefix : sourcePrefix;
  
  ui.log.step(`Scanning bucket: ${pc.cyan(bucketName)}`);
  if (endpoint) {
    ui.log.step(`Endpoint: ${pc.dim(endpoint)}`);
  }
  if (filterPrefix) {
    ui.log.step(`Prefix Filter: ${pc.cyan(filterPrefix)}`);
  }
  
  const sScan = ui.spinner();
  sScan.start('Listing objects in bucket...');
  
  let keys: string[] = [];
  try {
    keys = await scanBucketObjects({
      bucketName,
      accessKeyId,
      secretAccessKey,
      endpoint: endpoint || undefined,
      region,
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
    const sCompare = ui.spinner();
    sCompare.start('Fetching currently indexed assets in imgix...');
    
    let existingPaths = new Set<string>();
    try {
      let nextUrl: string | null = `https://api.imgix.com/api/v1/sources/${src.id}/assets?page[size]=100`;
      let pageCount = 1;
      
      while (nextUrl) {
        sCompare.message(`Fetching asset page ${pageCount}...`);
        const pageData = await fetchAssetsPage(config.apiKey, nextUrl);
        const assets = pageData.data || [];
        
        for (const asset of assets) {
          let originPath = asset.attributes?.origin_path || '';
          if (!originPath && asset.id.includes('/')) {
            originPath = asset.id.substring(asset.id.indexOf('/') + 1);
          }
          if (originPath) {
            const cleanPath = originPath.startsWith('/') ? originPath.substring(1) : originPath;
            existingPaths.add(cleanPath);
          }
        }
        nextUrl = pageData.links?.next || null;
        pageCount++;
        await delay(100);
      }
      
      keysToSync = keys.filter(k => {
        const cleanK = k.startsWith('/') ? k.substring(1) : k;
        return !existingPaths.has(cleanK);
      });
      
      sCompare.stop(`Fetch complete. Found ${keysToSync.length} assets not yet indexed in imgix.`);
    } catch (err: any) {
      sCompare.stop('Failed to compare assets');
      ui.log.error(`Error comparing assets: ${err.message}`);
      process.exit(1);
    }
    
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
  
  // Confirm sync operation
  const confirmProceed = await ui.confirm({
    message: `Ready to index ${keysToSync.length} asset(s) into Source "${src.name}". Proceed?`,
    initialValue: true
  });
  
  if (ui.isCancel(confirmProceed) || !confirmProceed) {
    ui.cancel('Sync aborted.');
    process.exit(0);
  }
  
  // Perform the sync using the addAssetToSource API call
  const sAdd = ui.spinner();
  sAdd.start(`Indexing ${keysToSync.length} assets...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < keysToSync.length; i++) {
    const originPath = keysToSync[i];
    sAdd.message(`[${i + 1}/${keysToSync.length}] Indexing: ${originPath}...`);
    
    const success = await addAssetToSource(config.apiKey, src.id, originPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await delay(100);
  }
  
  sAdd.stop(`Indexing complete.`);
  ui.log.success(`Successfully queued/indexed: ${successCount}, Failed: ${failCount}`);
  
  ui.outro('Sync complete.');
}
