import { Command } from 'commander';
import { runAssetsList, runAssetsInspect, runAssetsSync } from '@/cmd/assets/index.js';


export function registerAssetsCommands(program: Command) {
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

  assetsCmd
    .command('sync')
    .description('Scan origin storage bucket and index assets into imgix')
    .option('--prefix <prefix>', 'Prefix to filter scanned assets')
    .action(async (opts) => {
      await runAssetsSync(opts);
    });
}
