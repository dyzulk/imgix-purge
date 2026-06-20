import pc from 'picocolors';
import { getGlobalAuth, setGlobalAuth, clearGlobalAuth } from '../pkg/auth.js';
import { ui } from '../internal/ui/prompts.js';

export async function runAuthSetup() {
  ui.intro('imgix CLI Authentication Setup');
  ui.log.info('You can find your API Key, Source ID, and Secure URL Token in the imgix dashboard.');

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

  const sourceId = await ui.text({
    message: 'Enter your imgix Source ID (e.g. 5ed5...):',
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'Source ID is required.';
    },
  });

  if (ui.isCancel(sourceId)) {
    ui.cancel('Setup cancelled.');
    process.exit(0);
  }

  const secureToken = await ui.text({
    message: 'Enter your imgix Secure URL Token (optional, press Enter to skip):',
  });

  if (ui.isCancel(secureToken)) {
    ui.cancel('Setup cancelled.');
    process.exit(0);
  }

  const cleanToken = (secureToken as string || '').trim();

  setGlobalAuth({
    apiKey: (apiKey as string).trim(),
    sourceId: (sourceId as string).trim(),
    secureToken: cleanToken ? cleanToken : undefined,
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
    
    let tokenStatus = pc.dim('Not configured');
    if (auth.secureToken) {
      tokenStatus = auth.secureToken.length > 6
        ? pc.cyan(`${auth.secureToken.substring(0, 2)}••••••••${auth.secureToken.substring(auth.secureToken.length - 2)}`)
        : pc.cyan('••••••••');
    }
    
    ui.note(
      `Source ID:    ${pc.cyan(auth.sourceId)}\nAPI Key:      ${pc.cyan(maskedKey)}\nSecure Token: ${tokenStatus}\n\n${pc.dim('Saved in: ~/.imgix-auth.json')}`,
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
