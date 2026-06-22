import { Command } from 'commander';
import { runDiagnose } from '@/cmd/diagnose.js';


export function registerDiagnoseCommand(program: Command) {
  program
    .command('diagnose <url>')
    .description('Analyze CDN cache and compression headers for a given URL')
    .action(async (url) => {
      await runDiagnose(url);
    });
}
