import { Command } from 'commander';
import { runSelfUpdate } from '../../cmd/update.js';

export function registerUpdateCommands(program: Command, version: string) {
  program
    .command('update')
    .alias('self-update')
    .description('Check for updates and update the CLI')
    .action(async () => {
      await runSelfUpdate(version);
    });
}
