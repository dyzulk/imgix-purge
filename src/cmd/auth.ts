import pc from 'picocolors';
import { getGlobalAuth, setGlobalAuth, clearGlobalAuth } from '@/pkg/auth.js';
import { ui } from '@/internal/ui/prompts.js';
import { EXTERNAL_URLS } from '@/pkg/constants.js';

export async function runAuthSetup() {
  ui.intro('imgix CLI Authentication Setup');
  ui.log.info('To manage or create API keys and view official scopes/permissions, visit:');
  ui.log.info(pc.cyan(EXTERNAL_URLS.docsOverview));
  ui.log.info('You can generate your keys directly at: ' + pc.cyan(EXTERNAL_URLS.dashboardApiKeys));


  const apiKey = await ui.text({
    message: 'Enter your imgix Management API Key (e.g. ak_...):',
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'API Key is required.';
    },
  });

  if (ui.isCancel(apiKey)) {
    ui.cancel('Setup cancelled.');
    process.exit(0);
  }

  setGlobalAuth({
    apiKey: (apiKey as string).trim(),
  });
  
  ui.outro(pc.green('✔ Credentials successfully saved globally!\n') + 
          pc.dim('You can now run "imgix" commands from anywhere.'));
}

export async function runAuthStatus() {
  const auth = getGlobalAuth();
  ui.intro('imgix CLI Authentication Status');
  
  if (auth) {
    const maskedKey = auth.apiKey.length > 8 
      ? `${auth.apiKey.substring(0, 4)}••••••••${auth.apiKey.substring(auth.apiKey.length - 4)}`
      : '••••••••';
    
    ui.note(
      `API Key:      ${pc.cyan(maskedKey)}\n\n${pc.dim('Saved in: ~/.imgix-auth.json')}`,
      pc.green('✔ Logged in')
    );
    ui.outro('You are ready to manage imgix assets!');
  } else {
    ui.note(
      'No global credentials found.\nRun "imgix auth setup" to configure.',
      pc.red('✖ Not logged in')
    );
    ui.outro('Authentication required.');
  }
}

export async function runAuthClear() {
  const auth = getGlobalAuth();
  if (!auth) {
    ui.intro('imgix CLI');
    ui.log.warn('You are not logged in. No global credentials to clear.');
    ui.outro('Operation finished.');
    return;
  }

  ui.intro('imgix CLI Logout');

  const proceed = await ui.confirm({
    message: 'Are you sure you want to delete your saved global credentials?',
    initialValue: false,
  });

  if (ui.isCancel(proceed)) {
    ui.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (proceed) {
    clearGlobalAuth();
    ui.outro(pc.green('✔ Global credentials have been removed.'));
  } else {
    ui.outro(pc.yellow('ℹ Operation cancelled.'));
  }
}
