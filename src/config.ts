export interface Config {
  apiKey: string;
  sourceId: string;
  domains: string[];
  execute: boolean;
  dryRun: boolean;
}

const apiKey = process.env.IMGIX_API_KEY || '';
const sourceId = process.env.IMGIX_SOURCE_ID || '';

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
  domains,
  execute,
  dryRun,
};


export function validateConfig(): void {
  if (!config.apiKey || !config.sourceId) {
    console.error('Error: Missing API Key or Source ID.');
    console.error('Please provide them via --api-key and --source-id flags, or by setting the IMGIX_API_KEY and IMGIX_SOURCE_ID environment variables.');
    console.error('Run "imgix-purge --help" for more details.');
    process.exit(1);
  }
}

