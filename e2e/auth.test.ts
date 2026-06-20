import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('imgix auth e2e', () => {
  it('should print help text for auth command', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js auth --help`);
    assert.match(stdout, /Usage: imgix auth/);
    assert.match(stdout, /Manage global authentication credentials/);
    assert.equal(stderr, '');
  });

  it('should print not logged in status when credentials do not exist', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js auth status`, {
      env: { ...process.env, HOME: 'C:\\Users\\dyzulk\\AppData\\Local\\Temp\\nonexistent-home', USERPROFILE: 'C:\\Users\\dyzulk\\AppData\\Local\\Temp\\nonexistent-home' }
    });
    assert.match(stdout, /Not logged in/);
    assert.equal(stderr, '');
  });
});
