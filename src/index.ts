#!/usr/bin/env node
import { Command } from 'commander';
import { runPurge } from './cmd/index.js';
import { config, showHelp } from './config.js';

const program = new Command();

program
  .name('imgix-purge')
  .description('A CLI tool to bulk purge all assets in an imgix Source cache.')
  .version('1.0.0');

// Register the purge command
program
  .command('purge')
  .description('Purge all assets in the imgix Source')
  .option('-d, --dry-run', 'Run in simulation mode (list assets that would be purged without calling the Purge API)')
  .option('--domain <dom>', 'Specify target domain(s) manually (comma-separated)')
  .option('--api-key <key>', 'Your imgix Management API Key (overrides IMGIX_API_KEY env)')
  .option('--source-id <id>', 'Your imgix Source ID (overrides IMGIX_SOURCE_ID env)')
  .allowUnknownOption(true)
  .action(async (options) => {
    // If the user passed -h in the old way that our config.ts handles, 
    // it will still be caught here or in commander natively.
    if (config.help) {
      showHelp();
      return;
    }
    
    // Override config with CLI flags if provided
    if (options.apiKey) config.apiKey = options.apiKey;
    if (options.sourceId) config.sourceId = options.sourceId;
    
    await runPurge();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
