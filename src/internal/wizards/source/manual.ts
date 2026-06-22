import { ui } from '../../ui/prompts.js';

export async function promptManualSource() {
  const domainInput = await ui.text({
    message: 'Enter target imgix Domain manually (e.g. my-source.imgix.net):',
    validate: (val) => {
      if (!val || val.trim().length === 0) return 'Domain is required.';
    }
  });
  if (ui.isCancel(domainInput)) {
    ui.cancel('Operation cancelled.');
    process.exit(0);
  }
  
  const secureTokenInput = await ui.text({
    message: 'Enter Secure URL Token manually (optional, press Enter to skip):'
  });
  if (ui.isCancel(secureTokenInput)) {
    ui.cancel('Operation cancelled.');
    process.exit(0);
  }
  
  const cleanDomain = (domainInput as string).trim().replace(/^(https?:\/\/)?/, '');
  const cleanToken = (secureTokenInput as string || '').trim();
  
  return {
    id: 'manual',
    name: 'Manual Target',
    domains: [cleanDomain],
    secureToken: cleanToken || undefined
  };
}
