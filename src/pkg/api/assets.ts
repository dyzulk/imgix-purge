import { API_BASE } from './client.js';

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

export interface AssetDetailResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      origin_path: string;
      media_type: string;
      file_size: number;
      width: number;
      height: number;
      date_created: string;
      date_modified: string;
      [key: string]: any;
    };
  };
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

export async function fetchAssets(apiKey: string, sourceId: string, cursor?: string): Promise<AssetResponse> {
  let url = `${API_BASE}/sources/${sourceId}/assets?page[size]=50`;
  if (cursor) {
    url += `&page[cursor]=${cursor}`;
  }
  return fetchAssetsPage(apiKey, url);
}

export async function fetchAssetDetail(apiKey: string, sourceId: string, originPath: string): Promise<AssetDetailResponse> {
  const cleanPath = originPath.startsWith('/') ? originPath.substring(1) : originPath;
  const assetId = `${sourceId}/${cleanPath}`;
  const response = await fetch(`${API_BASE}/assets/${encodeURIComponent(assetId)}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch asset details (HTTP ${response.status}): ${text}`);
  }

  return (await response.json()) as AssetDetailResponse;
}

export async function addAssetToSource(apiKey: string, sourceId: string, originPath: string): Promise<boolean> {
  const cleanPath = originPath.startsWith('/') ? originPath.substring(1) : originPath;
  const response = await fetch(`${API_BASE}/sources/${sourceId}/assets/add/${encodeURIComponent(cleanPath)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (response.ok) {
    return true;
  } else {
    const text = await response.text();
    console.error(`Failed to add asset ${originPath} (HTTP ${response.status}): ${text}`);
    return false;
  }
}
