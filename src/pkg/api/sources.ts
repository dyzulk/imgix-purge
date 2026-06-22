import { API_ENDPOINTS } from '@/pkg/api/client.js';

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

export interface SourceListResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      name: string;
      enabled: boolean;
      secure_url_token?: string;
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
      secure_url_token?: string;
      deployment: {
        type: string;
        imgix_subdomains?: string[];
        custom_domains?: string[];
        [key: string]: any;
      };
    };
  };
}

export async function fetchSourceDomains(apiKey: string, sourceId: string): Promise<string[]> {
  console.log(`Fetching details for Source ID: ${sourceId}...`);
  const response = await fetch(API_ENDPOINTS.sources.detail(sourceId), {
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

export async function fetchSources(apiKey: string): Promise<SourceListResponse> {
  const response = await fetch(API_ENDPOINTS.sources.list(), {
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
  const response = await fetch(API_ENDPOINTS.sources.detail(sourceId), {
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

