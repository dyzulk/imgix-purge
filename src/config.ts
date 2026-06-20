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
Usage: imgix-purge [options]

An automation tool to bulk purge all assets in an imgix Source cache.

Options:
  -d, --dry-run        Run in simulation mode (list assets that would be purged without calling the Purge API)
  -h, --help           Display this help menu and exit
  --api-key <key>      Your imgix Management API Key (overrides IMGIX_API_KEY env)
  --source-id <id>     Your imgix Source ID (overrides IMGIX_SOURCE_ID env)
  --domain <dom>       Specify target domain(s) manually (comma-separated) to skip auto-detection
                       Example: --domain my-source.imgix.net,images.mycompany.com

Environment Variables:
  - IMGIX_API_KEY      Your imgix Management API Key (e.g. ak_...)
  - IMGIX_SOURCE_ID    Your imgix Source ID (e.g. 5ed5...)

  Optional:
  - IMGIX_DOMAINS      Comma-separated list of domains to skip auto-detection (requires 'Sources' permission)
`);
  process.exit(0);
}

export function validateConfig(): void {
  if (!config.apiKey || !config.sourceId) {
    console.error('Error: Missing API Key or Source ID.');
    console.error('Please provide them via --api-key and --source-id flags, or by setting the IMGIX_API_KEY and IMGIX_SOURCE_ID environment variables.');
    console.error('Run "imgix-purge --help" for more details.');
    process.exit(1);
  }
}

