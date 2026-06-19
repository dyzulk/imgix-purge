import { config, validateConfig, showHelp } from './config.js';
import { delay, normalizePath } from './utils.js';
import { fetchSourceDomains, fetchAssetsPage, submitPurgeRequest } from './api.js';

async function main() {
  // Show help menu first if requested
  if (config.help) {
    showHelp();
  }

  console.log('--- imgix Bulk Purge Tool ---');
  if (config.dryRun) {
    console.log('Mode: DRY-RUN (no changes will be made).');
    console.log('To execute the purge, run the command without any flags.');
  } else {
    console.log('Mode: EXECUTE (purge requests will be sent).');
  }
  console.log('------------------------------');

  // Validate environment variables
  validateConfig();

  try {
    const domains = await fetchSourceDomains(config.apiKey, config.sourceId);

    if (domains.length === 0) {
      console.error('Error: No subdomains or custom domains found for this Source.');
      process.exit(1);
    }

    console.log(`Target domains detected: ${domains.join(', ')}`);

    let nextUrl: string | null = `https://api.imgix.com/api/v1/sources/${config.sourceId}/assets?page[size]=100`;
    const assetsToPurge: string[] = [];
    let pageCount = 1;

    console.log('\nFetching asset list...');
    while (nextUrl) {
      console.log(`Fetching page ${pageCount}...`);
      const pageData = await fetchAssetsPage(config.apiKey, nextUrl);
      const assets = pageData.data || [];

      for (const asset of assets) {
        let originPath = asset.attributes?.origin_path || '';
        
        // Fallback to extraction from ID if origin_path attribute is not present
        if (!originPath && asset.id.includes('/')) {
          originPath = asset.id.substring(asset.id.indexOf('/') + 1);
        }

        if (originPath) {
          const cleanPath = normalizePath(originPath);
          for (const domain of domains) {
            assetsToPurge.push(`https://${domain}${cleanPath}`);
          }
        }
      }

      nextUrl = pageData.links?.next || null;
      pageCount++;
      // Small delay between listing requests
      await delay(250);
    }

    console.log(`\nFound ${assetsToPurge.length} URLs to purge.`);

    if (assetsToPurge.length === 0) {
      console.log('No assets found to purge. Exiting.');
      return;
    }

    if (config.dryRun) {
      console.log('\n--- List of URLs that would be purged (Dry-run) ---');
      assetsToPurge.forEach((url, index) => {
        console.log(`[${index + 1}] ${url}`);
      });
      console.log('\nDry-run complete. No purge requests were sent.');
      console.log('To run this for real, execute with: pnpm purge');
    } else {
      console.log('\nStarting purge process (3 requests per second to respect rate limits)...');
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < assetsToPurge.length; i++) {
        const url = assetsToPurge[i];
        console.log(`[${i + 1}/${assetsToPurge.length}] Purging: ${url}...`);
        
        const success = await submitPurgeRequest(config.apiKey, url);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // Throttle to respect the rate limit (4 req/sec)
        await delay(350);
      }

      console.log(`\nPurge process complete.`);
      console.log(`Successfully queued: ${successCount}`);
      console.log(`Failed: ${failCount}`);
    }
  } catch (error) {
    console.error('An error occurred during execution:', error);
    process.exit(1);
  }
}

main();
