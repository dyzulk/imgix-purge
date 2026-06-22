import pc from 'picocolors';
import { fetchSources, fetchSourceDetail } from '../../pkg/api/index.js';
import { ui } from '../ui/prompts.js';

export interface ResolvedSource {
  id: string;
  name: string;
  domains: string[];
  secureToken?: string;
}

export async function resolveTargetSources(apiKey: string): Promise<ResolvedSource[]> {
  const s = ui.spinner();
  s.start('Fetching available Sources...');
  
  let sourcesList;
  try {
    sourcesList = await fetchSources(apiKey);
    s.stop('Sources list retrieved successfully');
  } catch (error: any) {
    s.stop('Failed to retrieve Sources');
    
    ui.log.warn('Unable to retrieve Sources from API (your key may lack "Sources" read permission).');
    
    const domainInput = await ui.text({
      message: 'Enter target imgix Domain manually (e.g. my-source.imgix.net):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Domain is required.';
      }
    });
    if (ui.isCancel(domainInput)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    const secureTokenInput = await ui.text({
      message: 'Enter Secure URL Token manually (optional, press Enter to skip):'
    });
    if (ui.isCancel(secureTokenInput)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    const cleanDomain = (domainInput as string).trim().replace(/^(https?:\/\/)?/, '');
    const cleanToken = (secureTokenInput as string || '').trim();
    
    return [{
      id: 'manual',
      name: 'Manual Target',
      domains: [cleanDomain],
      secureToken: cleanToken || undefined
    }];
  }
  
  const activeSources = (sourcesList.data || []).filter(src => src.attributes.enabled);
  if (activeSources.length === 0) {
    ui.log.error('No active Sources found on this account.');
    process.exit(1);
  }
  
  let chosenSources: typeof activeSources = [];
  
  if (activeSources.length === 1) {
    const singleSrc = activeSources[0];
    ui.log.info(`Automatically selected the only active Source: ${pc.cyan(singleSrc.attributes.name)} (${singleSrc.id})`);
    chosenSources = [singleSrc];
  } else {
    const options = activeSources.map((src) => {
      const subdomains = [
        ...(src.attributes.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`),
        ...(src.attributes.deployment.custom_domains || [])
      ].join(', ');
      return {
        value: src.id,
        label: `${src.attributes.name} (${src.id})`,
        hint: subdomains || 'no domains'
      };
    });
    
    const selectedIds = await ui.multiselect({
      message: 'Select target Source(s) (Space to check/uncheck, Enter to confirm):',
      options,
      required: true
    });
    
    if (ui.isCancel(selectedIds)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    const selectedSet = new Set(selectedIds as string[]);
    chosenSources = activeSources.filter(src => selectedSet.has(src.id));
  }
  
  const s2 = ui.spinner();
  s2.start('Resolving Source details (domains and security tokens)...');
  
  try {
    const results = await Promise.all(
      chosenSources.map(async (src) => {
        const details = await fetchSourceDetail(apiKey, src.id);
        const attr = details.data.attributes;
        const subdomains = (attr.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`);
        const custom = attr.deployment.custom_domains || [];
        const domains = [...subdomains, ...custom];
        const secureToken = attr.secure_url_token || undefined;
        return {
          id: src.id,
          name: attr.name,
          domains,
          secureToken
        };
      })
    );
    s2.stop('Source details resolved');
    return results;
  } catch (error: any) {
    s2.stop('Failed to resolve Source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}

export async function resolveSingleTargetSource(apiKey: string): Promise<ResolvedSource> {
  const s = ui.spinner();
  s.start('Fetching available Sources...');
  
  let sourcesList;
  try {
    sourcesList = await fetchSources(apiKey);
    s.stop('Sources list retrieved successfully');
  } catch (error: any) {
    s.stop('Failed to retrieve Sources');
    
    ui.log.warn('Unable to retrieve Sources from API (your key may lack "Sources" read permission).');
    
    const domainInput = await ui.text({
      message: 'Enter target imgix Domain manually (e.g. my-source.imgix.net):',
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Domain is required.';
      }
    });
    if (ui.isCancel(domainInput)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    const secureTokenInput = await ui.text({
      message: 'Enter Secure URL Token manually (optional, press Enter to skip):'
    });
    if (ui.isCancel(secureTokenInput)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    const cleanDomain = (domainInput as string).trim().replace(/^(https?:\/\/)?/, '');
    const cleanToken = (secureTokenInput as string || '').trim();
    
    return {
      id: 'manual',
      name: 'Manual Target',
      domains: [cleanDomain],
      secureToken: cleanToken || undefined
    };
  }
  
  const activeSources = (sourcesList.data || []).filter(src => src.attributes.enabled);
  if (activeSources.length === 0) {
    ui.log.error('No active Sources found on this account.');
    process.exit(1);
  }
  
  let chosenSource: typeof activeSources[0];
  
  if (activeSources.length === 1) {
    chosenSource = activeSources[0];
    ui.log.info(`Automatically selected the only active Source: ${pc.cyan(chosenSource.attributes.name)} (${chosenSource.id})`);
  } else {
    const options = activeSources.map((src) => {
      const subdomains = [
        ...(src.attributes.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`),
        ...(src.attributes.deployment.custom_domains || [])
      ].join(', ');
      return {
        value: src.id,
        label: `${src.attributes.name} (${src.id})`,
        hint: subdomains || 'no domains'
      };
    });
    
    const selectedId = await ui.select({
      message: 'Select target Source:',
      options
    });
    
    if (ui.isCancel(selectedId)) {
      ui.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    chosenSource = activeSources.find(src => src.id === selectedId)!;
  }
  
  const s2 = ui.spinner();
  s2.start('Resolving Source details (domains and security token)...');
  
  try {
    const details = await fetchSourceDetail(apiKey, chosenSource.id);
    const attr = details.data.attributes;
    const subdomains = (attr.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`);
    const custom = attr.deployment.custom_domains || [];
    const domains = [...subdomains, ...custom];
    const secureToken = attr.secure_url_token || undefined;
    s2.stop('Source details resolved');
    return {
      id: chosenSource.id,
      name: attr.name,
      domains,
      secureToken
    };
  } catch (error: any) {
    s2.stop('Failed to resolve Source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
