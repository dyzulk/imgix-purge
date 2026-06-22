import { ui } from '../../../internal/ui/prompts.js';
import { fetchAssetsPage } from '../../../pkg/api/index.js';
import { delay } from '../../../internal/utils/helper.js';

export async function filterNewAssetsOnly(
  apiKey: string,
  sourceId: string,
  keys: string[]
): Promise<string[]> {
  const sCompare = ui.spinner();
  sCompare.start('Fetching currently indexed assets in imgix...');
  
  let existingPaths = new Set<string>();
  try {
    let nextUrl: string | null = `https://api.imgix.com/api/v1/sources/${sourceId}/assets?page[size]=100`;
    let pageCount = 1;
    
    while (nextUrl) {
      sCompare.message(`Fetching asset page ${pageCount}...`);
      const pageData = await fetchAssetsPage(apiKey, nextUrl);
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
    
    const keysToSync = keys.filter(k => {
      const cleanK = k.startsWith('/') ? k.substring(1) : k;
      return !existingPaths.has(cleanK);
    });
    
    sCompare.stop(`Fetch complete. Found ${keysToSync.length} assets not yet indexed in imgix.`);
    return keysToSync;
  } catch (err: any) {
    sCompare.stop('Failed to compare assets');
    ui.log.error(`Error comparing assets: ${err.message}`);
    process.exit(1);
  }
}
