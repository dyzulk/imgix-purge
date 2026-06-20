import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export interface Config {
  apiKey: string;
  sourceId: string;
  domains: string[];
  execute: boolean;
  dryRun: boolean;
  help: boolean;
}

const apiKey = process.env.IMGIX_API_KEY || '';
const sourceId = process.env.IMGIX_SOURCE_ID || '';

const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');
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
  help,
};

export function showHelp(): void {
  console.log(`
Usage: pnpm purge [options]

An automation tool to bulk purge all assets in an imgix Source cache.

Options:
  -d, --dry-run        Run in simulation mode (list assets that would be purged without calling the Purge API)
  -h, --help           Display this help menu and exit
  --domain, -dom <dom> Specify target domain(s) manually (comma-separated) to skip auto-detection
                       Example: --domain my-source.imgix.net,images.mycompany.com

Environment Variables:
  The following variables must be defined in your .env.local file:
  - IMGIX_API_KEY      Your imgix Management API Key (e.g. ak_...)
  - IMGIX_SOURCE_ID    Your imgix Source ID (e.g. 5ed5...)

  Optional:
  - IMGIX_DOMAINS      Comma-separated list of domains to skip auto-detection (requires 'Sources' permission)
`);
  process.exit(0);
}

export function validateConfig(): void {
  if (!config.apiKey || !config.sourceId) {
    console.error('Error: Please define IMGIX_API_KEY and IMGIX_SOURCE_ID in your .env.local file.');
    console.error('Run "pnpm purge --help" for more details.');
    process.exit(1);
  }
}

