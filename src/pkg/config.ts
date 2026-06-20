import { getGlobalAuth } from './auth.js';

export interface Config {
  apiKey: string;
  sourceId: string;
  secureToken: string;
  domains: string[];
  batchSize: number;
  execute: boolean;
  dryRun: boolean;
}

const globalAuth = getGlobalAuth();
const apiKey = process.env.IMGIX_API_KEY || globalAuth?.apiKey || '';
const sourceId = process.env.IMGIX_SOURCE_ID || globalAuth?.sourceId || '';
const secureToken = process.env.IMGIX_SECURE_TOKEN || globalAuth?.secureToken || '';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const execute = !dryRun;

// Parse manual domains from CLI --domain or -dom
const domainArgIndex = args.findIndex(arg => arg === '--domain' || arg === '-dom');
const cliDomains = domainArgIndex !== -1 && args[domainArgIndex + 1]
  ? args[domainArgIndex + 1].split(',').map(d => d.trim())
  : [];

// Parse manual domains from env IMGIX_DOMAINS
const envDomains = process.env.IMGIX_DOMAINS
  ? process.env.IMGIX_DOMAINS.split(',').map(d => d.trim())
  : [];

const domains = cliDomains.length > 0 ? cliDomains : envDomains;

export const config: Config = {
  apiKey,
  sourceId,
  secureToken,
  domains,
  batchSize: 10000,
  execute,
  dryRun,
};

export function validateConfig(): void {
  if (!config.apiKey || !config.sourceId) {
    console.error('Error: Missing API Key or Source ID.');
    console.error('Please configure them globally by running: "imgix auth setup"');
    console.error('Or provide them via --api-key and --source-id flags / environment variables.');
    console.error('Run "imgix --help" for more details.');
    process.exit(1);
  }
}
