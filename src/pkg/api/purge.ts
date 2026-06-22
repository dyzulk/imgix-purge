import { API_ENDPOINTS } from '@/pkg/api/client.js';

export async function submitPurgeRequest(apiKey: string, urlToPurge: string): Promise<boolean> {
  const response = await fetch(API_ENDPOINTS.purge(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          url: urlToPurge,
        },
        type: 'purges',
      },
    }),
  });

  if (response.ok) {
    return true;
  } else {
    const text = await response.text();
    console.error(`Failed to purge ${urlToPurge} (HTTP ${response.status}): ${text}`);
    return false;
  }
}

