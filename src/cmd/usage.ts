import pc from 'picocolors';
import { fetchBillingUsage } from '@/pkg/api/index.js';
import { config, validateConfig } from '@/pkg/config.js';
import { ui } from '@/internal/ui/prompts.js';


export async function runUsageStatus() {
  await validateConfig();
  
  const s = ui.spinner();
  s.start('Fetching usage reports...');
  
  try {
    const res = await fetchBillingUsage(config.apiKey);
    s.stop('Usage reports fetched successfully');
    
    ui.intro('imgix Billing & Usage Status');
    
    const reports = res.data || [];
    if (reports.length === 0) {
      ui.note('No usage reports available for this account.', 'Usage Status');
    } else {
      const lines = reports.map((r: any) => {
        const type = r.attributes?.report_type || 'Unknown';
        const date = r.attributes?.date_created || 'Unknown';
        return `ID:   ${pc.cyan(r.id)}\nType: ${type}\nDate: ${date}`;
      });
      ui.note(lines.slice(0, 5).join('\n---\n'), 'Recent Usage Reports (Latest 5)');
    }
    
    ui.outro('Detailed reports are available in your imgix dashboard.');
  } catch (error: any) {
    s.stop('Failed to retrieve usage status');
    
    if (error.status === 403) {
      ui.intro('imgix Billing & Usage Status');
      ui.note(
        'Unable to access billing reports with current credentials.\n\n' +
        'This is common if:\n' +
        '  1. Your API Key does not have the "Billing" or "Analytics" permission.\n' +
        '  2. Your imgix subscription plan does not support programmatic usage metrics.\n\n' +
        'Recommendation: Verify API key permissions in your imgix dashboard.',
        pc.yellow('Warning: Access Forbidden (403)')
      );
      ui.outro('Finished status check.');
      return;
    }
    
    ui.log.error(error.message || error);
    process.exit(1);
  }
}
