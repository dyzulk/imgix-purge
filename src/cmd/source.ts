import pc from 'picocolors';
import { fetchSources, fetchSourceDetail } from '../pkg/api.js';
import { resolveSingleTargetSource } from '../internal/utils/resolver.js';
import { config, validateConfig } from '../pkg/config.js';
import { ui } from '../internal/ui/prompts.js';

export async function runSourceList() {
  await validateConfig();
  
  const s = ui.spinner();
  s.start('Fetching sources...');
  
  try {
    const res = await fetchSources(config.apiKey);
    s.stop('Sources fetched successfully');
    
    if (res.data.length === 0) {
      ui.log.info('No sources found.');
      return;
    }
    
    ui.intro('imgix Sources');
    const lines = res.data.map((src) => {
      const status = src.attributes.enabled ? pc.green('Active') : pc.red('Disabled');
      const domains = [
        ...(src.attributes.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`),
        ...(src.attributes.deployment.custom_domains || [])
      ].join(', ');
      
      return `ID:      ${pc.cyan(src.id)}\nName:    ${src.attributes.name} (${status})\nType:    ${src.attributes.deployment.type}\nDomains: ${pc.dim(domains || 'None')}`;
    });
    
    ui.note(lines.join('\n---\n'), 'Available Sources');
    ui.outro('Run "imgix source info <source-id>" for detailed configuration.');
  } catch (error: any) {
    s.stop('Failed to fetch sources');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}

export async function runSourceInfo(sourceId?: string) {
  await validateConfig();
  
  let targetId = (sourceId || '').trim();
  
  if (!targetId) {
    // Dynamically resolve target source using single selector
    const src = await resolveSingleTargetSource(config.apiKey);
    if (src.id === 'manual') {
      ui.log.error('Cannot query details for a manual domain target.');
      process.exit(1);
    }
    targetId = src.id;
  }
  
  const s = ui.spinner();
  s.start(`Fetching details for source ${targetId}...`);
  
  try {
    const res = await fetchSourceDetail(config.apiKey, targetId);
    s.stop('Source details fetched successfully');
    
    const src = res.data;
    ui.intro(`Source Details: ${src.attributes.name}`);
    
    const status = src.attributes.enabled ? pc.green('Active') : pc.red('Disabled');
    const subdomains = (src.attributes.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`);
    const custom = src.attributes.deployment.custom_domains || [];
    
    let detailText = `ID:       ${pc.cyan(src.id)}\nStatus:   ${status}\nType:     ${src.attributes.deployment.type}\n`;
    
    if (subdomains.length > 0) {
      detailText += `Subdomain: ${pc.cyan(subdomains.join(', '))}\n`;
    }
    if (custom.length > 0) {
      detailText += `Custom:    ${pc.cyan(custom.join(', '))}\n`;
    }
    
    const type = src.attributes.deployment.type;
    if (src.attributes.deployment[type]) {
      detailText += `\n[ Configuration details (${type}) ]\n`;
      const configObj = src.attributes.deployment[type];
      for (const [key, val] of Object.entries(configObj)) {
        detailText += `${key}: ${val}\n`;
      }
    }
    
    ui.note(detailText, 'Configuration info');
    ui.outro('Use this source ID for caching or purges.');
  } catch (error: any) {
    s.stop('Failed to fetch source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
