import pc from 'picocolors';
import crypto from 'node:crypto';
import { resolveTargetSources } from '@/internal/wizards/source-resolver.js';
import { config, validateConfig } from '@/pkg/config.js';
import { ui } from '@/internal/ui/prompts.js';


function signPath(path: string, params: string, secureToken: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const toSign = `${secureToken}${cleanPath}${params}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export async function runUrlSign(pathArg?: string, paramsArg?: string) {
  await validateConfig();
  
  ui.intro('imgix URL Signer');
  
  let targetPath = (pathArg || '').trim();
  if (!targetPath) {
    const inputPath = await ui.text({
      message: 'Enter asset path (e.g. /images/logo.png):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Path is required.';
      }
    });
    
    if (ui.isCancel(inputPath)) {
      ui.cancel('Signing cancelled.');
      process.exit(0);
    }
    targetPath = (inputPath as string).trim();
  }
  
  let targetParams = (paramsArg || '').trim();
  if (!pathArg && !paramsArg) {
    const inputParams = await ui.text({
      message: 'Enter query parameters (optional, e.g. w=400&h=300):'
    });
    
    if (ui.isCancel(inputParams)) {
      ui.cancel('Signing cancelled.');
      process.exit(0);
    }
    targetParams = (inputParams as string).trim();
  }
  
  const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  if (targetParams && !targetParams.startsWith('?')) {
    targetParams = `?${targetParams}`;
  }
  
  const selectedSources = await resolveTargetSources(config.apiKey);
  
  const results: string[] = [];
  
  for (const src of selectedSources) {
    const separator = targetParams ? '&' : '?';
    
    if (src.secureToken) {
      const signature = signPath(cleanPath, targetParams, src.secureToken);
      for (const domain of src.domains) {
        results.push(`${pc.bold(src.name)}:\n  https://${domain}${cleanPath}${targetParams}${separator}s=${signature}`);
      }
    } else {
      for (const domain of src.domains) {
        results.push(`${pc.bold(src.name)} ${pc.yellow('(Warning: No Secure Token)')}:\n  https://${domain}${cleanPath}${targetParams}`);
      }
    }
  }
  
  ui.intro('Signed imgix URLs');
  ui.note(results.join('\n\n'), 'Generated URLs');
  ui.outro('URL signing complete.');
}

export async function runUrlOptimize(urlStr?: string) {
  let targetUrl = (urlStr || '').trim();
  if (targetUrl) {
    try {
      new URL(targetUrl);
    } catch {
      ui.log.error('Invalid URL. Please provide a full absolute URL including the protocol and hostname (e.g., https://my-source.imgix.net/path/to/image.png).');
      process.exit(1);
    }
  }

  if (!targetUrl) {
    const inputUrl = await ui.text({
      message: 'Enter the full imgix image URL to optimize:',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'URL is required.';
        try {
          new URL(val);
        } catch {
          return 'Please enter a valid absolute URL.';
        }
      }
    });
    
    if (ui.isCancel(inputUrl)) {
      ui.cancel('Optimization cancelled.');
      process.exit(0);
    }
    targetUrl = (inputUrl as string).trim();
  }
  
  try {
    const parsedUrl = new URL(targetUrl);
    
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
    
    const optimizedUrl = new URL(targetUrl);
    optimizedUrl.search = newParams.toString();
    
    let noteText = `Original URL:  ${pc.dim(targetUrl)}\n\n`;
    if (recommendation) {
      noteText += `${pc.green('Recommendations:')}\n${recommendation}\n`;
      noteText += `Optimized URL: ${pc.cyan(optimizedUrl.toString())}`;
    } else {
      noteText += `${pc.green('Your URL is already fully optimized!')}`;
    }
    
    ui.note(noteText, 'Analysis Results');
    ui.outro('Optimization analysis complete.');
  } catch (error: any) {
    ui.log.error(`Invalid URL provided: ${error.message || error}`);
    process.exit(1);
  }
}
