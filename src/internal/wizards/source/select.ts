import pc from 'picocolors';
import { ui } from '@/internal/ui/prompts.js';


export async function selectSingleSource(activeSources: any[]): Promise<any> {
  if (activeSources.length === 1) {
    const chosenSource = activeSources[0];
    ui.log.info(`Automatically selected the only active Source: ${pc.cyan(chosenSource.attributes.name)} (${chosenSource.id})`);
    return chosenSource;
  }

  const options = activeSources.map((src) => {
    const subdomains = [
      ...(src.attributes.deployment.imgix_subdomains || []).map((sub: string) => `${sub}.imgix.net`),
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
  
  return activeSources.find(src => src.id === selectedId)!;
}

export async function selectMultipleSources(activeSources: any[]): Promise<any[]> {
  if (activeSources.length === 1) {
    const singleSrc = activeSources[0];
    ui.log.info(`Automatically selected the only active Source: ${pc.cyan(singleSrc.attributes.name)} (${singleSrc.id})`);
    return [singleSrc];
  }

  const options = activeSources.map((src) => {
    const subdomains = [
      ...(src.attributes.deployment.imgix_subdomains || []).map((sub: string) => `${sub}.imgix.net`),
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
  return activeSources.filter(src => selectedSet.has(src.id));
}
