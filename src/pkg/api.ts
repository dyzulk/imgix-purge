const API_BASE = 'https://api.imgix.com/api/v1';

export interface SourceResponse {
  data: {
    id: string;
    attributes: {
      name: string;
      deployment: {
        imgix_subdomains?: string[];
        custom_domains?: string[];
      };
    };
  };
}

export interface AssetResponse {
  data: Array<{
    id: string;
    attributes?: {
      origin_path?: string;
    };
  }>;
  links?: {
    next?: string | null;
  };
}

export async function fetchSourceDomains(apiKey: string, sourceId: string): Promise<string[]> {
  console.log(`Fetching details for Source ID: ${sourceId}...`);
  const response = await fetch(`${API_BASE}/sources/${sourceId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch source details (HTTP ${response.status}): ${text}`);
  }

  const json = (await response.json()) as SourceResponse;
  const deployment = json.data.attributes.deployment;
  const subdomains = (deployment.imgix_subdomains || []).map((sub) => `${sub}.imgix.net`);
  const customDomains = deployment.custom_domains || [];

  return [...subdomains, ...customDomains];
}

export async function fetchAssetsPage(apiKey: string, url: string): Promise<AssetResponse> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch assets (HTTP ${response.status}): ${text}`);
  }

  return (await response.json()) as AssetResponse;
}

export async function submitPurgeRequest(apiKey: string, urlToPurge: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/purge`, {
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

export interface SourceListResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      name: string;
      enabled: boolean;
      deployment: {
        type: string;
        imgix_subdomains?: string[];
        custom_domains?: string[];
        [key: string]: any;
      };
    };
  }>;
}

export interface SourceDetailResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      enabled: boolean;
      deployment: {
        type: string;
        imgix_subdomains?: string[];
        custom_domains?: string[];
        [key: string]: any;
      };
    };
  };
}

export async function fetchSources(apiKey: string): Promise<SourceListResponse> {
  const response = await fetch(`${API_BASE}/sources`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch sources (HTTP ${response.status}): ${text}`);
  }

  return (await response.json()) as SourceListResponse;
}

export async function fetchSourceDetail(apiKey: string, sourceId: string): Promise<SourceDetailResponse> {
  const response = await fetch(`${API_BASE}/sources/${sourceId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch source details (HTTP ${response.status}): ${text}`);
  }

  return (await response.json()) as SourceDetailResponse;
}
