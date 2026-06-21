#!/usr/bin/env node
import { Command } from 'commander';
import { runPurge } from '../cmd/index.js';
import { runAuthSetup, runAuthStatus, runAuthClear } from '../cmd/auth.js';
import { runSourceList, runSourceInfo } from '../cmd/source.js';
import { runAssetsList, runAssetsInspect } from '../cmd/assets.js';
import { runUrlSign, runUrlOptimize } from '../cmd/url.js';
import { runDiagnose } from '../cmd/diagnose.js';
import { runUsageStatus } from '../cmd/usage.js';
import { runSelfUpdate } from '../cmd/update.js';
import { config } from '../pkg/config.js';

declare const __VERSION__: string;

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
      output = output.replace('  -d, --dry-run', '\n  [ Execution Modes ]\n  -d, --dry-run');
      output = output.replace('  -V, --version', '\n  [ System Options ]\n  -V, --version');
      process.stdout.write(output);
    }
  })
  // --- Execution & Tuning ---
  .option('--batch-size <num>', 'Number of assets to purge in each API call (default: 10000)', parseInt)
  
  // --- Execution Modes ---
  .option('-d, --dry-run', 'Run in simulation mode (list assets that would be purged without calling the Purge API)')
  
  // --- System Options ---
  .version(__VERSION__, '-V, --version', 'Output the version number')
  .helpOption('-h, --help', 'Display help for command');

program.hook('preAction', (thisCommand, actionCommand) => {
  const globalOpts = program.opts();
  if (globalOpts.dryRun) config.dryRun = globalOpts.dryRun;
  if (globalOpts.batchSize && !isNaN(globalOpts.batchSize)) config.batchSize = globalOpts.batchSize;
});

// Register the purge command
program
  .command('purge')
  .description('Purge all assets in the imgix Source')
  .allowUnknownOption(true)
  .action(async () => {
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

// Register the source command group
const sourceCmd = program
  .command('source')
  .description('Manage and retrieve info about imgix Sources')
  .addHelpCommand(false);

sourceCmd
  .command('list')
  .description('List all sources associated with the API key')
  .action(async () => {
    await runSourceList();
  });

sourceCmd
  .command('info [source-id]')
  .description('Get detailed configuration of a specific source')
  .action(async (sourceId) => {
    await runSourceInfo(sourceId);
  });

// Register the assets command group
const assetsCmd = program
  .command('assets')
  .description('Explore and inspect assets within the imgix Source')
  .addHelpCommand(false);

assetsCmd
  .command('list')
  .description('List files in the active Source (paginated)')
  .option('--cursor <cursor>', 'Cursor for next page')
  .action(async (opts) => {
    await runAssetsList(opts);
  });

assetsCmd
  .command('inspect <path>')
  .description('Retrieve properties of a file')
  .option('-a, --api', 'Query Management API metadata instead of public render properties')
  .action(async (path, opts) => {
    await runAssetsInspect(path, opts);
  });

// Register the url command group
const urlCmd = program
  .command('url')
  .description('Generate signed URLs or analyze query parameters')
  .addHelpCommand(false);

urlCmd
  .command('sign <path> [params]')
  .description('Sign a path and optional parameters locally')
  .action(async (path, params) => {
    await runUrlSign(path, params);
  });

urlCmd
  .command('optimize <url>')
  .description('Recommend performance optimization parameters for a URL')
  .action(async (url) => {
    await runUrlOptimize(url);
  });

// Register the diagnose command
program
  .command('diagnose <url>')
  .description('Analyze CDN cache and compression headers for a given URL')
  .action(async (url) => {
    await runDiagnose(url);
  });

// Register the usage command group
const usageCmd = program
  .command('usage')
  .description('Check bandwidth and usage metrics')
  .addHelpCommand(false);

usageCmd
  .command('status')
  .description('Display recent credit consumption reports')
  .action(async () => {
    await runUsageStatus();
  });

// Register the self-update command
program
  .command('update')
  .alias('self-update')
  .description('Check for updates and update the CLI')
  .action(async () => {
    await runSelfUpdate(__VERSION__);
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
