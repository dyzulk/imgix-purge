import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix assets e2e', () => {
  it('should print help text for assets command', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js assets --help`);
    assert.match(stdout, /Usage: imgix assets/);
    assert.match(stdout, /Explore and inspect assets within the imgix Source/);
    assert.equal(stderr, '');
  });

  it('should fail cleanly if API key is missing for list', async () => {
    try {
      await execAsync(`node ./bin/imgix.js assets list`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });

  it('should fail cleanly if API key is missing for inspect', async () => {
    try {
      await execAsync(`node ./bin/imgix.js assets inspect image.jpg`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });
});
