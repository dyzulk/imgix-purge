#!/usr/bin/env node
import { Command } from 'commander';
import { runPurge } from './cmd/index.js';
import { runAuthSetup, runAuthStatus, runAuthClear } from './cmd/auth.js';
import { config } from './config.js';

const program = new Command();

program
  .name('imgix')
  .description('A CLI companion tool to manage and purge imgix assets.')
  .configureHelp({
    sortSubcommands: true,
  })
  .addHelpCommand(false)
  .configureOutput({
    writeOut: (str) => {
      let output = str;
      output = output.replace('  --api-key', '\n  [ Configuration & Targeting ]\n  --api-key');
      output = output.replace('  -d, --dry-run', '\n  [ Execution Modes ]\n  -d, --dry-run');
      output = output.replace('  -V, --version', '\n  [ System Options ]\n  -V, --version');
      process.stdout.write(output);
    }
  })
  // --- Configuration & Targeting ---
  .option('--api-key <key>', 'Your imgix Management API Key (overrides IMGIX_API_KEY env)')
  .option('--source-id <id>', 'Your imgix Source ID (overrides IMGIX_SOURCE_ID env)')
  .option('--domain <dom>', 'Specify target domain(s) manually (comma-separated)')
  .option('--batch-size <num>', 'Number of assets to purge in each API call (default: 10000)', parseInt)
  
  // --- Execution Modes ---
  .option('-d, --dry-run', 'Run in simulation mode (list assets that would be purged without calling the Purge API)')
  
  // --- System Options ---
  .version('1.0.0', '-V, --version', 'Output the version number')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpText('after', `
Environment Variables:
  - IMGIX_API_KEY      Your imgix Management API Key (e.g. ak_...)
  - IMGIX_SOURCE_ID    Your imgix Source ID (e.g. 5ed5...)

  Optional:
  - IMGIX_DOMAINS      Comma-separated list of domains to skip auto-detection (requires 'Sources' permission)
`);

// Register the purge command
program
  .command('purge')
  .description('Purge all assets in the imgix Source')
  .allowUnknownOption(true)
  .action(async () => {
    const globalOpts = program.opts();
    
    // Override config with CLI flags if provided (from global options)
    if (globalOpts.apiKey) config.apiKey = globalOpts.apiKey;
    if (globalOpts.sourceId) config.sourceId = globalOpts.sourceId;
    if (globalOpts.dryRun) config.dryRun = globalOpts.dryRun;
    if (globalOpts.batchSize && !isNaN(globalOpts.batchSize)) config.batchSize = globalOpts.batchSize;
    
    // Domain comes from global options
    if (globalOpts.domain) config.domains = globalOpts.domain.split(',').map((d: string) => d.trim());
    
    await runPurge();
  });

// Register the auth command group
const authCmd = program
  .command('auth')
  .description('Manage global authentication credentials')
  .addHelpCommand(false);

authCmd
  .command('setup')
  .description('Run interactive wizard to securely store API Key and Source ID globally')
  .action(async () => {
    await runAuthSetup();
  });

authCmd
  .command('status')
  .description('Check the status of your global credentials')
  .action(async () => {
    await runAuthStatus();
  });

authCmd
  .command('clear')
  .alias('logout')
  .description('Delete your saved global credentials')
  .action(async () => {
    await runAuthClear();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
