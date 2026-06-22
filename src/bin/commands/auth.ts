import { Command } from 'commander';
import { runAuthSetup, runAuthStatus, runAuthClear } from '@/cmd/auth.js';


export function registerAuthCommands(program: Command) {
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
}
