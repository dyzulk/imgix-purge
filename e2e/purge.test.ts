import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

describe('imgix-purge e2e', () => {
  it('should print help text when --help is passed', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix-purge.js --help`);
    
    // Commander generates standard help text containing our tool description
    assert.match(stdout, /A CLI tool to bulk purge all assets/);
    assert.match(stdout, /Usage: imgix-purge/);
    assert.equal(stderr, '');
  });

  it('should print version when --version is passed', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix-purge.js --version`);
    assert.match(stdout, /1\.0\.0/);
    assert.equal(stderr, '');
  });

  it('should fail cleanly if API key or source ID is missing', async () => {
    try {
      // Pass an empty environment to ensure no env variables leak in
      await execAsync(`node ./bin/imgix-purge.js`, { env: {} });
      assert.fail('Should have failed');
    } catch (error: any) {
      assert.match(error.stderr || error.stdout, /Error: Missing API Key or Source ID/);
    }
  });
});
