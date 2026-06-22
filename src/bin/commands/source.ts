import { Command } from 'commander';
import { runSourceList, runSourceInfo } from '@/cmd/source.js';


export function registerSourceCommands(program: Command) {
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
}
