import { describe, it } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const execAsync = promisify(exec);

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const version = pkg.version;

describe('imgix e2e', () => {
  it('should print help text when invoked with no arguments', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js`);
    assert.match(stdout, /Usage: imgix/);
    assert.match(stdout, /A CLI companion tool to manage and purge imgix assets/);
    assert.equal(stderr, '');
  });

  it('should print help text when --help is passed', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js --help`);
    assert.match(stdout, /A CLI companion tool to manage and purge imgix assets/);
    assert.match(stdout, /Usage: imgix/);
    assert.equal(stderr, '');
  });

  it('should print version when --version is passed', async () => {
    const { stdout, stderr } = await execAsync(`node ./bin/imgix.js --version`);
    assert.match(stdout, new RegExp(version.replace(/\./g, '\\.')));
    assert.equal(stderr, '');
  });
});
