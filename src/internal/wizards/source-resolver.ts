import { ui } from '../ui/prompts.js';
import { promptManualSource } from './source/manual.js';
import { selectSingleSource, selectMultipleSources } from './source/select.js';
import { getActiveSources, resolveSourceDetails } from './source/fetch.js';

export interface ResolvedSource {
  id: string;
  name: string;
  domains: string[];
  secureToken?: string;
}

export async function resolveTargetSources(apiKey: string): Promise<ResolvedSource[]> {
  const s = ui.spinner();
  s.start('Fetching available Sources...');
  
  let activeSources: any[];
  try {
    activeSources = await getActiveSources(apiKey);
    s.stop('Sources list retrieved successfully');
  } catch (error: any) {
    s.stop('Failed to retrieve Sources');
    ui.log.warn('Unable to retrieve Sources from API (your key may lack "Sources" read permission).');
    
    const manualResult = await promptManualSource();
    return [manualResult];
  }
  
  if (activeSources.length === 0) {
    ui.log.error('No active Sources found on this account.');
    process.exit(1);
  }
  
  const chosenSources = await selectMultipleSources(activeSources);
  
  const s2 = ui.spinner();
  s2.start('Resolving Source details (domains and security tokens)...');
  
  try {
    const results = await Promise.all(
      chosenSources.map(src => resolveSourceDetails(apiKey, src.id))
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
  
  let activeSources: any[];
  try {
    activeSources = await getActiveSources(apiKey);
    s.stop('Sources list retrieved successfully');
  } catch (error: any) {
    s.stop('Failed to retrieve Sources');
    ui.log.warn('Unable to retrieve Sources from API (your key may lack "Sources" read permission).');
    
    return promptManualSource();
  }
  
  if (activeSources.length === 0) {
    ui.log.error('No active Sources found on this account.');
    process.exit(1);
  }
  
  const chosenSource = await selectSingleSource(activeSources);
  
  const s2 = ui.spinner();
  s2.start('Resolving Source details (domains and security token)...');
  
  try {
    const result = await resolveSourceDetails(apiKey, chosenSource.id);
    s2.stop('Source details resolved');
    return result;
  } catch (error: any) {
    s2.stop('Failed to resolve Source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
