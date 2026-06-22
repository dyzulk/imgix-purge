import { fetchSources, fetchSourceDetail } from '@/pkg/api/index.js';

export async function getActiveSources(apiKey: string): Promise<any[]> {
  const sourcesList = await fetchSources(apiKey);
  return (sourcesList.data || []).filter(src => src.attributes.enabled);
}

export async function resolveSourceDetails(apiKey: string, srcId: string) {
  const details = await fetchSourceDetail(apiKey, srcId);
  const attr = details.data.attributes;
  const subdomains = (attr.deployment.imgix_subdomains || []).map(sub => `${sub}.imgix.net`);
  const custom = attr.deployment.custom_domains || [];
  const domains = [...subdomains, ...custom];
  const secureToken = attr.secure_url_token || undefined;
  return {
    id: srcId,
    name: attr.name,
    domains,
    secureToken
  };
}
