import { API_BASE } from './client.js';

export async function fetchBillingUsage(apiKey: string): Promise<any> {
  const response = await fetch(`${API_BASE}/reports`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`HTTP ${response.status}: ${text}`);
    (err as any).status = response.status;
    throw err;
  }

  return await response.json();
}
