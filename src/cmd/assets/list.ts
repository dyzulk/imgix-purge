import pc from 'picocolors';
import { fetchAssets } from '@/pkg/api/index.js';
import { resolveSingleTargetSource } from '@/internal/wizards/source-resolver.js';
import { config, validateConfig } from '@/pkg/config.js';
import { ui } from '@/internal/ui/prompts.js';


export async function runAssetsList(options: { cursor?: string }) {
  await validateConfig();
  
  ui.intro('imgix Asset Explorer');
  
  const src = await resolveSingleTargetSource(config.apiKey);
  
  if (src.id === 'manual') {
    ui.log.error('Cannot list assets on a manually configured target.');
    process.exit(1);
  }
  
  const s = ui.spinner();
  s.start('Fetching assets list...');
  
  try {
    const res = await fetchAssets(config.apiKey, src.id, options.cursor);
    s.stop('Assets fetched successfully');
    
    const assets = res.data || [];
    if (assets.length === 0) {
      ui.log.info('No assets found.');
      return;
    }
    
    ui.intro(`Assets for Source: ${src.name}`);
    
    const domain = src.domains[0];
    const lines = assets.map((asset) => {
      let originPath = asset.attributes?.origin_path || '';
      if (!originPath && asset.id.includes('/')) {
        originPath = asset.id.substring(asset.id.indexOf('/') + 1);
      }
      const cleanPath = originPath.startsWith('/') ? originPath : `/${originPath}`;
      if (domain) {
        return `https://${domain}${cleanPath}`;
      }
      return `${pc.cyan(cleanPath)}`;
    });
    
    ui.note(lines.join('\n'), 'Assets (Page Limit: 50)');
    
    const nextCursor = res.links?.next 
      ? new URL(res.links.next).searchParams.get('page[cursor]')
      : null;
      
    if (nextCursor) {
      ui.log.info(`Next Page Cursor: ${pc.yellow(nextCursor)}`);
      ui.outro(`To view the next page, run: "imgix assets list --cursor ${nextCursor}"`);
    } else {
      ui.outro('End of asset list.');
    }
  } catch (error: any) {
    s.stop('Failed to fetch assets');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
