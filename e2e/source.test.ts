import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix source e2e', () => {
  it('should print help text for source command', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js source --help`);
    assert.match(stdout, /Usage: imgix source/);
    assert.match(stdout, /Manage and retrieve info about imgix Sources/);
    assert.equal(stderr, '');
  });

  it('should fail cleanly if API key is missing for list', async () => {
    try {
      await execAsync(`node ./bin/imgix.js source list`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });

  it('should fail cleanly if API key is missing for info', async () => {
    try {
      await execAsync(`node ./bin/imgix.js source info 5ed5`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });
});
