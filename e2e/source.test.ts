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
});
