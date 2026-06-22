import { Command } from 'commander';
import { runUsageStatus } from '../../cmd/usage.js';

export function registerUsageCommands(program: Command) {
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
}
