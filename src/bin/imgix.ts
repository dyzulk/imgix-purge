#!/usr/bin/env node
import { Command } from 'commander';
import { config } from '../pkg/config.js';
import { registerPurgeCommand } from './commands/purge.js';
import { registerAuthCommands } from './commands/auth.js';
import { registerSourceCommands } from './commands/source.js';
import { registerAssetsCommands } from './commands/assets.js';
import { registerUrlCommands } from './commands/url.js';
import { registerDiagnoseCommand } from './commands/diagnose.js';
import { registerUsageCommands } from './commands/usage.js';
import { registerUpdateCommands } from './commands/update.js';

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

// Register commands
registerPurgeCommand(program);
registerAuthCommands(program);
registerSourceCommands(program);
registerAssetsCommands(program);
registerUrlCommands(program);
registerDiagnoseCommand(program);
registerUsageCommands(program);
registerUpdateCommands(program, __VERSION__);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
