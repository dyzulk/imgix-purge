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
});
