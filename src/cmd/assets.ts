import pc from 'picocolors';
import crypto from 'node:crypto';
import { fetchAssets, fetchAssetDetail, fetchSourceDomains } from '../pkg/api.js';
import { config, validateConfig } from '../pkg/config.js';
import { ui } from '../internal/ui/prompts.js';

function signPath(path: string, params: string, secureToken: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const toSign = `${secureToken}${cleanPath}${params}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export async function runAssetsList(options: { cursor?: string }) {
  validateConfig();
  
  const s = ui.spinner();
  s.start('Fetching assets list...');
  
  try {
    const res = await fetchAssets(config.apiKey, config.sourceId, options.cursor);
    s.stop('Assets fetched successfully');
    
    const assets = res.data || [];
    if (assets.length === 0) {
      ui.log.info('No assets found.');
      return;
    }
    
    ui.intro('imgix Assets');
    
    const lines = assets.map((asset) => {
      let originPath = asset.attributes?.origin_path || '';
      if (!originPath && asset.id.includes('/')) {
        originPath = asset.id.substring(asset.id.indexOf('/') + 1);
      }
      return `${pc.cyan(originPath)}`;
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

export async function runAssetsInspect(pathArg: string, options: { api?: boolean }) {
  validateConfig();
  
  const cleanPath = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;
  const s = ui.spinner();
  
  if (options.api) {
    s.start(`Inspecting asset via Management API: ${cleanPath}...`);
    try {
      const res = await fetchAssetDetail(config.apiKey, config.sourceId, cleanPath);
      s.stop('Asset metadata retrieved');
      
      ui.intro(`Management API Metadata: ${cleanPath}`);
      ui.note(JSON.stringify(res.data, null, 2), 'Asset Details');
      ui.outro('Inspection complete.');
    } catch (error: any) {
      s.stop('Failed to retrieve asset details from API');
      ui.log.error(error.message || error);
      process.exit(1);
    }
  } else {
    s.start(`Inspecting asset via Render API (fm=json): ${cleanPath}...`);
    try {
      let domains: string[] = [];
      if (config.domains.length > 0) {
        domains = config.domains;
      } else {
        domains = await fetchSourceDomains(config.apiKey, config.sourceId);
      }
      
      if (domains.length === 0) {
        throw new Error('No domain available for Render API inspect. Please configure --domain.');
      }
      
      const domain = domains[0];
      let url = `https://${domain}${cleanPath}?fm=json`;
      if (config.secureToken) {
        const signature = signPath(cleanPath, '?fm=json', config.secureToken);
        url += `&s=${signature}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Render API failed (HTTP ${response.status}): ${text}`);
      }
      
      const metadata = await response.json();
      s.stop('Render metadata retrieved');
      
      ui.intro(`Render API Metadata (fm=json): ${cleanPath}`);
      ui.note(JSON.stringify(metadata, null, 2), 'Image Properties');
      ui.outro('Inspection complete.');
    } catch (error: any) {
      s.stop('Failed to retrieve render metadata');
      ui.log.error(error.message || error);
      process.exit(1);
    }
  }
}
