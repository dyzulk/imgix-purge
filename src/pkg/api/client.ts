export const API_BASE = 'https://api.imgix.com/api/v1';

export const API_ENDPOINTS = {
  sources: {
    list: () => `${API_BASE}/sources`,
    detail: (sourceId: string) => `${API_BASE}/sources/${sourceId}`,
    assets: (sourceId: string, size?: number) => {
      let url = `${API_BASE}/sources/${sourceId}/assets`;
      if (size !== undefined) {
        url += `?page[size]=${size}`;
      }
      return url;
    },
    addAsset: (sourceId: string, cleanPath: string) =>
      `${API_BASE}/sources/${sourceId}/assets/add/${encodeURIComponent(cleanPath)}`,
  },
  assets: {
    detail: (assetId: string) => `${API_BASE}/assets/${encodeURIComponent(assetId)}`,
  },
  purge: () => `${API_BASE}/purge`,
  reports: () => `${API_BASE}/reports`,
} as const;
