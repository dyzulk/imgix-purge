#!/usr/bin/env node
import { Command } from 'commander';
import { runPurge } from './cmd/index.js';
import { config } from './config.js';

const program = new Command();

program
  .name('imgix-purge')
  .description('A CLI tool to bulk purge all assets in an imgix Source cache.')
  .configureHelp({
    sortSubcommands: true,
  })
  .addHelpCommand(false)
  .option('--api-key <key>', 'Your imgix Management API Key (overrides IMGIX_API_KEY env)')
  .option('--source-id <id>', 'Your imgix Source ID (overrides IMGIX_SOURCE_ID env)')
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
  .option('-d, --dry-run', 'Run in simulation mode (list assets that would be purged without calling the Purge API)')
  .option('--domain <dom>', 'Specify target domain(s) manually (comma-separated)')
  .allowUnknownOption(true)
  .action(async (options) => {
    const globalOpts = program.opts();
    
    // Override config with CLI flags if provided (from global or subcommand options)
    if (globalOpts.apiKey) config.apiKey = globalOpts.apiKey;
    if (globalOpts.sourceId) config.sourceId = globalOpts.sourceId;
    if (options.dryRun) config.dryRun = options.dryRun;
    
    // Domain comes from subcommand
    if (options.domain) config.domains = options.domain.split(',').map((d: string) => d.trim());
    
    await runPurge();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
