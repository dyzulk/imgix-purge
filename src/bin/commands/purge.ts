import { Command } from 'commander';
import { runPurge } from '@/cmd/purge.js';



export function registerPurgeCommand(program: Command) {
  program
    .command('purge')
    .description('Purge all assets in the imgix Source')
    .allowUnknownOption(true)
    .action(async () => {
      await runPurge();
    });
}
