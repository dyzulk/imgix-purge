import { Command } from 'commander';
import { runUrlSign, runUrlOptimize } from '@/cmd/url.js';


export function registerUrlCommands(program: Command) {
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
}
