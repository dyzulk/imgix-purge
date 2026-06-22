import pc from 'picocolors';
import { ui } from '../internal/ui/prompts.js';

export async function runDiagnose(urlStr?: string) {
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
      message: 'Enter target imgix image URL to diagnose:',
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
      ui.cancel('Diagnostics cancelled.');
      process.exit(0);
    }
    
    targetUrl = (inputUrl as string).trim();
  }
  
  const s = ui.spinner();
  s.start(`Running diagnostics on ${targetUrl}...`);
  
  try {
    let response = await fetch(targetUrl, { method: 'HEAD' });
    
    if (response.status === 405 || response.status === 403 || response.status === 404) {
      response = await fetch(targetUrl, { method: 'GET' });
    }
    
    s.stop('Diagnostics complete');
    
    ui.intro(`Diagnostic Report: ${targetUrl}`);
    
    const headers = response.headers;
    const status = response.status;
    
    const server = headers.get('server') || 'Unknown';
    const contentType = headers.get('content-type') || 'Unknown';
    const contentEncoding = headers.get('content-encoding') || 'none';
    const contentLength = headers.get('content-length') || 'Unknown';
    const cacheControl = headers.get('cache-control') || 'none';
    
    const xCache = headers.get('x-cache') || 'none';
    const xCacheHits = headers.get('x-cache-hits') || '0';
    const xServedBy = headers.get('x-served-by') || 'none';
    
    const cfCacheStatus = headers.get('cf-cache-status');
    
    let report = `${pc.bold('HTTP Status:')}      ${status >= 200 && status < 300 ? pc.green(status.toString()) : pc.red(status.toString())}\n`;
    report += `${pc.bold('Server:')}           ${pc.cyan(server)}\n`;
    report += `${pc.bold('Content-Type:')}     ${pc.cyan(contentType)}\n`;
    report += `${pc.bold('Encoding:')}         ${contentEncoding !== 'none' ? pc.green(contentEncoding) : pc.dim('none (uncompressed)')}\n`;
    
    if (contentLength !== 'Unknown') {
      const kb = (parseInt(contentLength) / 1024).toFixed(2);
      report += `${pc.bold('Content-Length:')}   ${pc.cyan(`${contentLength} bytes (~${kb} KB)`)}\n`;
    } else {
      report += `${pc.bold('Content-Length:')}   ${pc.dim('Unknown')}\n`;
    }
    
    report += `${pc.bold('Cache-Control:')}   ${pc.dim(cacheControl)}\n`;
    
    report += `\n${pc.bold('[ CDN Cache Diagnostics ]')}\n`;
    report += `${pc.bold('Fastly X-Cache:')}   ${xCache.includes('HIT') ? pc.green(xCache) : pc.yellow(xCache)}\n`;
    report += `${pc.bold('Cache Hits:')}       ${parseInt(xCacheHits) > 0 ? pc.green(xCacheHits) : pc.dim(xCacheHits)}\n`;
    report += `${pc.bold('Served By:')}        ${pc.dim(xServedBy)}\n`;
    
    if (cfCacheStatus) {
      report += `${pc.bold('CF-Cache-Status:')} ${cfCacheStatus.includes('HIT') ? pc.green(cfCacheStatus) : pc.yellow(cfCacheStatus)}\n`;
    }
    
    report += `\n${pc.bold('[ Recommendations ]')}\n`;
    let count = 1;
    if (contentEncoding === 'none' && !['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'].includes(contentType)) {
      report += `${count++}. Consider enabling Gzip/Brotli compression on your server.\n`;
    }
    if (xCache.includes('MISS')) {
      report += `${count++}. This request was a cache MISS. Subsequent requests should be cached (HIT).\n`;
    }
    if (cacheControl === 'none' || cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
      report += `${count++}. Cache-Control header prevents public CDN caching. Consider configuring longer max-age lifetimes.\n`;
    }
    
    if (count === 1) {
      report += pc.green('✔ Everything looks optimal for this URL!');
    }
    
    ui.note(report, 'Diagnostic details');
    ui.outro('Diagnostic check finished.');
  } catch (error: any) {
    s.stop('Failed to run diagnostics');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
