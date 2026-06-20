#!/usr/bin/env node
import { Command } from 'commander';
import { runPurge } from './cmd/index.js';
import { config, showHelp } from './config.js';

const program = new Command();

program
  .name('imgix-purge')
  .description('A CLI tool to bulk purge all assets in an imgix Source cache.')
  .version('1.0.0');

// Register the main/default command
program
  .command('purge', { isDefault: true })
  .description('Purge all assets in the imgix Source')
  .option('-d, --dry-run', 'Run in simulation mode (list assets that would be purged without calling the Purge API)')
  .option('--domain <dom>', 'Specify target domain(s) manually (comma-separated)')
  .allowUnknownOption(true)
  .action(async () => {
    // If the user passed -h in the old way that our config.ts handles, 
    // it will still be caught here or in commander natively.
    if (config.help) {
      showHelp();
      return;
    }
    await runPurge();
  });

program.parse(process.argv);
