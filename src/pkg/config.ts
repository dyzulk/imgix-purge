import { getGlobalAuth } from '@/pkg/auth.js';

export interface Config {
  apiKey: string;
  batchSize: number;
  execute: boolean;
  dryRun: boolean;
}

const getApiKey = () => {
  const globalAuth = getGlobalAuth();
  return globalAuth?.apiKey || '';
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const execute = !dryRun;

export const config: Config = {
  apiKey: getApiKey(),
  batchSize: 10000,
  execute,
  dryRun,
};

export async function validateConfig(): Promise<void> {
  if (!config.apiKey) {
    const { runAuthSetup } = await import('../cmd/auth.js');
    await runAuthSetup();
    
    const updatedAuth = getGlobalAuth();
    if (updatedAuth?.apiKey) {
      config.apiKey = updatedAuth.apiKey;
    } else {
      console.error('Error: API Key is required.');
      process.exit(1);
    }
  }
}
