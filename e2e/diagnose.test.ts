import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix diagnose e2e', () => {
  it('should fail with invalid URL', async () => {
    try {
      await execAsync(`node ./bin/imgix.js diagnose not-a-url`);
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Failed to parse URL|Invalid URL/);
    }
  });
});
