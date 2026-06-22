import pc from 'picocolors';
import crypto from 'node:crypto';
import { fetchAssetDetail } from '@/pkg/api/index.js';
import { resolveSingleTargetSource } from '@/internal/wizards/source-resolver.js';
import { config, validateConfig } from '@/pkg/config.js';
import { ui } from '@/internal/ui/prompts.js';


function signPath(path: string, params: string, secureToken: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const toSign = `${secureToken}${cleanPath}${params}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export async function runAssetsInspect(pathArg?: string, options?: { api?: boolean }) {
  await validateConfig();
  
  ui.intro('imgix Asset Inspector');
  
  let targetPath = (pathArg || '').trim();
  if (!targetPath) {
    const inputPath = await ui.text({
      message: 'Enter asset path to inspect (e.g. /images/logo.png):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Path is required.';
      }
    });
    
    if (ui.isCancel(inputPath)) {
      ui.cancel('Inspection cancelled.');
      process.exit(0);
    }
    targetPath = (inputPath as string).trim();
  }
  
  const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  
  const src = await resolveSingleTargetSource(config.apiKey);
  
  // Decide inspect mode
  let mode = options?.api ? 'api' : '';
  if (!options?.api) {
    const selectMode = await ui.select({
      message: 'Choose inspection metadata type:',
      options: [
        { value: 'render', label: 'Public Render Properties (Resolutions, Colors, EXIF via fm=json)' },
        { value: 'api', label: 'Management API Record (Administrative / storage properties)' }
      ]
    });
    
    if (ui.isCancel(selectMode)) {
      ui.cancel('Inspection cancelled.');
      process.exit(0);
    }
    mode = selectMode as string;
  }
  
  const s = ui.spinner();
  
  if (mode === 'api') {
    if (src.id === 'manual') {
      ui.log.error('Cannot query Management API for a manual domain target.');
      process.exit(1);
    }
    
    s.start(`Inspecting asset via Management API: ${cleanPath}...`);
    try {
      const res = await fetchAssetDetail(config.apiKey, src.id, cleanPath);
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
      if (src.domains.length === 0) {
        throw new Error('No domain resolved for the selected Source.');
      }
      
      const domain = src.domains[0];
      let url = `https://${domain}${cleanPath}?fm=json`;
      if (src.secureToken) {
        const signature = signPath(cleanPath, '?fm=json', src.secureToken);
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
