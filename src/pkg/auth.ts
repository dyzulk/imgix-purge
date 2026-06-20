import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const AUTH_FILE_PATH = path.join(os.homedir(), '.imgix-auth.json');

export interface AuthConfig {
  apiKey: string;
  sourceId: string;
}

export function getGlobalAuth(): AuthConfig | null {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const data = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.apiKey && parsed.sourceId) {
        return parsed as AuthConfig;
      }
    }
  } catch (error) {
    // Silently fail if file is unreadable or malformed
  }
  return null;
}

export function setGlobalAuth(auth: AuthConfig): void {
  try {
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(auth, null, 2), {
      encoding: 'utf-8',
      mode: 0o600, // Read/write for owner only
    });
  } catch (error: any) {
    console.error(`Failed to save auth config to ${AUTH_FILE_PATH}: ${error.message}`);
  }
}

export function clearGlobalAuth(): void {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      fs.unlinkSync(AUTH_FILE_PATH);
    }
  } catch (error: any) {
    console.error(`Failed to delete auth config at ${AUTH_FILE_PATH}: ${error.message}`);
  }
}
