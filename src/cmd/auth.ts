import * as p from '@clack/prompts';
import pc from 'picocolors';
import { getGlobalAuth, setGlobalAuth, clearGlobalAuth } from '../pkg/auth.js';

export async function runAuthSetup() {
  p.intro(pc.bgCyan(pc.black(' imgix-purge Authentication Setup ')));
  p.note('You can find your API Key and Source ID in the imgix dashboard.', 'Info');

  const apiKey = await p.text({
    message: 'Enter your imgix Management API Key (e.g. ak_...):',
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'API Key is required.';
    },
  });

  if (p.isCancel(apiKey)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const sourceId = await p.text({
    message: 'Enter your imgix Source ID (e.g. 5ed5...):',
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'Source ID is required.';
    },
  });

  if (p.isCancel(sourceId)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  setGlobalAuth({ apiKey: apiKey as string, sourceId: sourceId as string });
  
  p.outro(pc.green('✔ Credentials successfully saved globally!\n') + 
          pc.dim('You can now run "imgix-purge purge" from anywhere.'));
}

export async function runAuthStatus() {
  const auth = getGlobalAuth();
  p.intro(pc.bgCyan(pc.black(' imgix-purge Authentication Status ')));
  
  if (auth) {
    const maskedKey = auth.apiKey.length > 8 
      ? `${auth.apiKey.substring(0, 4)}••••••••${auth.apiKey.substring(auth.apiKey.length - 4)}`
      : '••••••••';
    
    p.note(
      `Source ID: ${pc.cyan(auth.sourceId)}\nAPI Key:   ${pc.cyan(maskedKey)}\n\n${pc.dim('Saved in: ~/.imgix-purge-auth.json')}`,
      pc.green('✔ Logged in')
    );
    p.outro('You are ready to purge!');
  } else {
    p.note(
      'No global credentials found.\nRun "imgix-purge auth setup" to configure.',
      pc.red('✖ Not logged in')
    );
    p.outro('Authentication required.');
  }
}

export async function runAuthClear() {
  const auth = getGlobalAuth();
  if (!auth) {
    p.intro(pc.bgCyan(pc.black(' imgix-purge ')));
    p.log.warn('You are not logged in. No global credentials to clear.');
    p.outro('Operation finished.');
    return;
  }

  p.intro(pc.bgCyan(pc.black(' imgix-purge Logout ')));

  const proceed = await p.confirm({
    message: 'Are you sure you want to delete your saved global credentials?',
    initialValue: false,
  });

  if (p.isCancel(proceed)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (proceed) {
    clearGlobalAuth();
    p.outro(pc.green('✔ Global credentials have been removed.'));
  } else {
    p.outro(pc.yellow('ℹ Operation cancelled.'));
  }
}
