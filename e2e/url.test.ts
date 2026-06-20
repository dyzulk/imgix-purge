import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix url e2e', () => {
  it('should print help text for url command', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js url --help`);
    assert.match(stdout, /Usage: imgix url/);
    assert.match(stdout, /Generate signed URLs or analyze query parameters/);
    assert.equal(stderr, '');
  });

  it('should optimize URL and print recommendation', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js url optimize https://my-source.imgix.net/image.jpg`);
    assert.match(stdout, /imgix URL Optimization Analysis/);
    assert.match(stdout, /Optimized URL:/);
    assert.equal(stderr, '');
  });
});
