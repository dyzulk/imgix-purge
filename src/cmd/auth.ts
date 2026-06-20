import { input, password, confirm } from '@inquirer/prompts';
import { getGlobalAuth, setGlobalAuth, clearGlobalAuth } from '../auth.js';

export async function runAuthSetup() {
  console.log('\n--- imgix-purge Authentication Setup ---\n');
  console.log('You can find your API Key and Source ID in the imgix dashboard.\n');

  const apiKey = await password({
    message: 'Enter your imgix Management API Key (e.g. ak_...):',
    validate: (value) => value.length > 0 || 'API Key is required.',
  });

  const sourceId = await input({
    message: 'Enter your imgix Source ID (e.g. 5ed5...):',
    validate: (value) => value.length > 0 || 'Source ID is required.',
  });

  setGlobalAuth({ apiKey, sourceId });
  console.log('\n✅ Credentials successfully saved globally!');
  console.log('You can now run "imgix-purge purge" from anywhere without specifying the API Key or Source ID again.');
}

export async function runAuthStatus() {
  const auth = getGlobalAuth();
  console.log('\n--- imgix-purge Authentication Status ---\n');
  
  if (auth) {
    const maskedKey = auth.apiKey.length > 8 
      ? `${auth.apiKey.substring(0, 4)}••••••••${auth.apiKey.substring(auth.apiKey.length - 4)}`
      : '••••••••';
    
    console.log('Status:   🟢 Logged in');
    console.log(`Source ID: ${auth.sourceId}`);
    console.log(`API Key:   ${maskedKey}`);
    console.log('\nCredentials are saved in your home directory (~/.imgix-purge-auth.json).');
  } else {
    console.log('Status:   🔴 Not logged in');
    console.log('No global credentials found.');
    console.log('\nRun "imgix-purge auth setup" to configure your global credentials.');
  }
}

export async function runAuthClear() {
  const auth = getGlobalAuth();
  if (!auth) {
    console.log('You are not logged in. No global credentials to clear.');
    return;
  }

  const proceed = await confirm({
    message: 'Are you sure you want to delete your saved global credentials?',
    default: false,
  });

  if (proceed) {
    clearGlobalAuth();
    console.log('🗑️  Global credentials have been removed.');
  } else {
    console.log('Operation cancelled.');
  }
}
