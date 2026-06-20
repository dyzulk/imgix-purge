export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function normalizePath(originPath: string): string {
  let normalized = originPath.trim();
  if (!normalized) {
    return '';
  }
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  return normalized;
}
