import pc from 'picocolors';
import crypto from 'node:crypto';
import { fetchSourceDomains } from '../pkg/api.js';
import { config, validateConfig } from '../pkg/config.js';
import { ui } from '../internal/ui/prompts.js';

function signPath(path: string, params: string, secureToken: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const toSign = `${secureToken}${cleanPath}${params}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export async function runUrlSign(pathArg: string, paramsArg?: string) {
  validateConfig();
  
  if (!config.secureToken) {
    ui.log.error('Error: Secure URL Token is required for signing.');
    ui.log.info('Please run "imgix auth setup" to configure your Secure URL Token globally,');
    ui.log.info('or provide it via the --secure-token CLI flag / IMGIX_SECURE_TOKEN environment variable.');
    process.exit(1);
  }
  
  const cleanPath = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;
  let params = (paramsArg || '').trim();
  if (params && !params.startsWith('?')) {
    params = `?${params}`;
  }
  
  const s = ui.spinner();
  s.start('Detecting target domains...');
  
  try {
    let domains: string[] = [];
    if (config.domains.length > 0) {
      domains = config.domains;
    } else {
      domains = await fetchSourceDomains(config.apiKey, config.sourceId);
    }
    s.stop('Domains resolved');
    
    if (domains.length === 0) {
      ui.log.error('Error: No domains found. Please specify target domains manually using --domain.');
      process.exit(1);
    }
    
    const signature = signPath(cleanPath, params, config.secureToken);
    const separator = params ? '&' : '?';
    
    ui.intro('Signed imgix URLs');
    
    const lines = domains.map((domain) => {
      return `https://${domain}${cleanPath}${params}${separator}s=${signature}`;
    });
    
    ui.note(lines.join('\n'), 'Generated signed URLs');
    ui.outro('These URLs are secure and tamper-proof.');
  } catch (error: any) {
    s.stop('Failed to generate signed URLs');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}

export async function runUrlOptimize(urlStr: string) {
  try {
    const parsedUrl = new URL(urlStr);
    
    ui.intro('imgix URL Optimization Analysis');
    
    const autoVal = parsedUrl.searchParams.get('auto');
    const hasFormat = autoVal ? autoVal.split(',').includes('format') : false;
    const hasCompress = autoVal ? autoVal.split(',').includes('compress') : false;
    
    let recommendation = '';
    const newParams = new URLSearchParams(parsedUrl.searchParams);
    
    if (!hasFormat || !hasCompress) {
      const currentAutos = autoVal ? autoVal.split(',').map(s => s.trim()) : [];
      if (!hasFormat) currentAutos.push('format');
      if (!hasCompress) currentAutos.push('compress');
      newParams.set('auto', currentAutos.join(','));
      recommendation += `- Enable automatic formatting and compression (auto=${currentAutos.join(',')})\n`;
    }
    
    const chVal = parsedUrl.searchParams.get('ch');
    const hasWidth = chVal ? chVal.split(',').includes('Width') : false;
    const hasDpr = chVal ? chVal.split(',').includes('DPR') : false;
    
    if (!hasWidth || !hasDpr) {
      const currentChs = chVal ? chVal.split(',').map(s => s.trim()) : [];
      if (!hasWidth) currentChs.push('Width');
      if (!hasDpr) currentChs.push('DPR');
      newParams.set('ch', currentChs.join(','));
      recommendation += `- Enable Client Hints for width and device pixel ratio (ch=${currentChs.join(',')})\n`;
    }
    
    const sig = parsedUrl.searchParams.get('s');
    if (sig) {
      recommendation += `- Warning: This URL was already signed. Modifying parameters will invalidate the signature unless resigned.\n`;
    }
    
    const optimizedUrl = new URL(urlStr);
    optimizedUrl.search = newParams.toString();
    
    let noteText = `Original URL:  ${pc.dim(urlStr)}\n\n`;
    if (recommendation) {
      noteText += `${pc.green('Recommendations:')}\n${recommendation}\n`;
      noteText += `Optimized URL: ${pc.cyan(optimizedUrl.toString())}`;
    } else {
      noteText += `${pc.green('Your URL is already fully optimized!')}`;
    }
    
    ui.note(noteText, 'Analysis Results');
    ui.outro('Keep learning about imgix URL parameters to maximize image performance.');
  } catch (error: any) {
    ui.log.error(`Invalid URL provided: ${error.message || error}`);
    process.exit(1);
  }
}
