import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix usage e2e', () => {
  it('should print help text for usage command', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js usage --help`);
    assert.match(stdout, /Usage: imgix usage/);
    assert.match(stdout, /Check bandwidth and usage metrics/);
    assert.equal(stderr, '');
  });

  it('should fail cleanly if API key is missing for status', async () => {
    try {
      await execAsync(`node ./bin/imgix.js usage status`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });
});
